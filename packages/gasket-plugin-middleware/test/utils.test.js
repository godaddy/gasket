/* eslint-disable max-nested-callbacks */
const app = {
  ready: jest.fn(),
  server: {
    emit: jest.fn()
  },
  register: jest.fn(),
  use: jest.fn()
};

const cookieParserMiddleware = jest.fn();
const compressionMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);


jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);

const { applyCookieParser, applyCompression, executeMiddlewareLifecycle } = require('../lib/utils');


describe('utils', function () {

  describe('applyCookieParser', function () {
    let middlewarePattern;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('adds the cookie-parser middleware before plugin middleware', async () => {
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (mw) => mw === cookieParserMiddleware);
      expect(cookieParserUsage).not.toBeNull();
    });

    it('adds the cookie-parser middleware with a excluded path', async () => {
      middlewarePattern = /somerandompattern/;
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (url, mw) => mw === cookieParserMiddleware
      );
      expect(cookieParserUsage).not.toBeNull();
    });
  });

  describe('applyCompression', function () {
    let compressionConfig;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('adds the compression middleware when enabled', async () => {
      compressionConfig = true;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).not.toBeNull();
    });

    it('does not add the compression middleware when disabled', async () => {
      compressionConfig = false;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).toBeNull();
    });

    describe('executeMiddlewareLifecycle', function () {
      let gasket, mockMwPlugins, middlewarePattern;
      const sandbox = jest.fn();
      beforeEach(() => {
        mockMwPlugins = [];

        gasket = {
          middleware: {},
          logger: {
            warn: jest.fn()
          },
          config: {},
          execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
            for (let i = 0; i < mockMwPlugins.length; i++) {
              // eslint-disable-next-line  no-loop-func
              fn(mockMwPlugins[i], () => mockMwPlugins[i]);
            }
            return jest.fn();
          })
        };

        jest.clearAllMocks();
      });

      it('executes the `middleware` lifecycle', async function () {
        executeMiddlewareLifecycle(gasket, app, middlewarePattern);
        expect(gasket.execApply).toHaveBeenCalledWith(
          'middleware',
          expect.any(Function)
        );
      });

      it('does not use empty middleware arrays', async function () {
        mockMwPlugins = [{ name: 'middleware-1' }, []];
        executeMiddlewareLifecycle(gasket, app, middlewarePattern);

        expect(app.use).not.toHaveBeenCalledWith([]);
      });

      // it('adds middleware from lifecycle (ignores falsy)', async () => {
      //   executeMiddlewareLifecycle(gasket, app, middlewarePattern);
      //   expect(app.use).toHaveBeenCalledTimes(4);

      //   app.use.mockClear();
      //   mockMwPlugins = [{ name: 'middlware-1' }, null];

      //   executeMiddlewareLifecycle(gasket, app, middlewarePattern);
      //   expect(app.use).toHaveBeenCalledTimes(5);
      // });

      // it('supports async middleware hooks', async () => {
      //   const middleware = Symbol();
      //   gasket = new GasketEngine([
      //     plugin,
      //     {
      //       name: '@mock/gasket-plugin',
      //       hooks: {
      //         middleware: async () => middleware
      //       }
      //     }
      //   ]);

      //   gasket.config = {};

      //   await gasket.exec('createServers');

      //   const middlewares = app.use.mock.calls.flat();
      //   expect(middlewares).toContain(middleware);
      // });

      // it('middleware paths in the config are used', async () => {
      //   const paths = ['/home'];
      //   gasket.config.middleware = [
      //     {
      //       plugin: 'middlware-1',
      //       paths
      //     }
      //   ];
      //   mockMwPlugins = [{ name: 'middlware-1' }];
      //   await plugin.hooks.createServers(gasket, {});

      //   expect(app.use.mock.calls[4]).toContain(paths);
      // });
    });
  });

  /**
   * Find the first call in a spy that matches a predicate
   * @param aSpy
   * @param aPredicate
   * @returns {any}
   */
  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.mock.calls.map(args => aPredicate(...args)).indexOf(true);
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }
});
