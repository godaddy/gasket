/* eslint-disable max-nested-callbacks */
const app = {
  ready: jest.fn(),
  server: {
    emit: jest.fn()
  },
  register: jest.fn(),
  use: jest.fn(),
  set: jest.fn()
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

    it('adds the cookie-parser middleware before plugin middleware', () => {
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (mw) => mw === cookieParserMiddleware
      );
      expect(cookieParserUsage).not.toBeNull();
    });

    it('adds the cookie-parser middleware with a pattern', () => {
      middlewarePattern = /somerandompattern/;
      applyCookieParser(app, middlewarePattern);

      const cookieParserUsage = findCall(
        app.use,
        (url, mw) => url === middlewarePattern && mw === cookieParserMiddleware
      );
      expect(cookieParserUsage).not.toBeNull();
    });
  });

  describe('applyCompression', function () {
    let compressionConfig;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('adds the compression middleware when enabled', () => {
      compressionConfig = true;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).not.toBeNull();
    });

    it('does not add the compression middleware when disabled', () => {
      compressionConfig = false;
      applyCompression(app, compressionConfig);

      const compressionUsage = findCall(
        app.use,
        (mw) => mw === compressionMiddleware
      );
      expect(compressionUsage).toBeNull();
    });
  });

  describe('executeMiddlewareLifecycle', function () {
    let gasket, mockMwPlugins, middlewarePattern, lifecycles;
    const sandbox = jest.fn();

    beforeEach(() => {
      mockMwPlugins = [];
      lifecycles = {
        middleware: jest.fn().mockResolvedValue([])
      };

      gasket = {
        config: {},
        logger: {
          warn: jest.fn()
        },
        exec: jest.fn().mockImplementation((lifecycle, ...args) =>
          lifecycles[lifecycle](...args)
        ),
        execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
          for (const plugin of mockMwPlugins) {
            await fn(plugin, plugin.handler);
          }
        })
      };

      jest.clearAllMocks();
    });

    it('executes the `middleware` lifecycle', async function () {
      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);
      expect(gasket.execApply).toHaveBeenCalledWith(
        'middleware',
        expect.any(Function)
      );
    });

    it('does not apply empty middleware arrays', async function () {
      mockMwPlugins = [
        { name: 'empty', handler: () => [] }
      ];
      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);

      expect(app.use).not.toHaveBeenCalledWith([]);
    });

    it('applies middleware with inclusion regex', async function () {
      const middlewareFn = jest.fn();
      middlewarePattern = /^\/gaskety\/routes\//;
      mockMwPlugins = [
        { name: 'middleware-1', handler: () => ({ handler: middlewareFn }) }
      ];

      await executeMiddlewareLifecycle(gasket, app, middlewarePattern);

      expect(app.use).toHaveBeenCalledWith(middlewarePattern, middlewareFn);
    });

    it('applies middleware config paths if configured', async function () {
      const middlewareFn = jest.fn();
      const mockMiddleware = { handler: middlewareFn, paths: [] };

      gasket.config.middleware = [
        { plugin: 'middleware-1', paths: ['/custom'] }
      ];
      mockMwPlugins = [
        {
          name: 'middleware-1',
          handler: () => mockMiddleware
        }
      ];

      await executeMiddlewareLifecycle(gasket, app);

      expect(app.use).toHaveBeenCalledWith(['/custom'], middlewareFn);
    });
  });

  /**
   * Find the first call in a spy that matches a predicate
   * @param {jest.SpyInstance} aSpy
   * @param {(args: any) => boolean} aPredicate
   * @returns {any}
   */
  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.mock.calls.findIndex(args => aPredicate(...args));
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }
});
