/* eslint-disable jsdoc/require-jsdoc */
const { setTimeout } = require('timers/promises');
const GasketEngine = require('@gasket/engine');
const app = { use: jest.fn(), post: jest.fn(), set: jest.fn() };
const mockExpress = jest.fn().mockReturnValue(app);
const bridgedApp = { use: jest.fn() };
const mockExpressBridge = jest.fn().mockReturnValue(bridgedApp);
const cookieParserMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const compressionMiddleware = jest.fn();
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);

jest.mock('express', () => mockExpress);
jest.mock('http2-express-bridge', () => mockExpressBridge);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);

const plugin = require('../lib/index');
const { name, version } = require('../package');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin.name).toBe(require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = ['create', 'createServers', 'metadata'];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});

// eslint-disable-next-line max-statements
describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;
  const sandbox = jest.fn();

  beforeEach(() => {
    mockMwPlugins = [];

    lifecycles = {
      errorMiddleware: jest.fn().mockResolvedValue([]),
      express: jest.fn().mockResolvedValue()
    };

    gasket = {
      middleware: {},
      logger: {
        warn: jest.fn()
      },
      config: {},
      exec: jest
        .fn()
        .mockImplementation((lifecycle, ...args) =>
          lifecycles[lifecycle](args)
        ),
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

  it('returns the handler app', async function () {
    const result = await plugin.hooks.createServers(gasket, {});
    expect(result).toEqual({ handler: app });
  });

  it('returns the handler as http2 bridge app', async function () {
    gasket.config.http2 = 8080;
    const result = await plugin.hooks.createServers(gasket);
    expect(result).toEqual({ handler: bridgedApp });
  });

  it('executes the `middleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.execApply).toHaveBeenCalledWith(
      'middleware',
      expect.any(Function)
    );
  });

  it('executes the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('express', app);
  });

  it('allows for an array of route functions', async function () {
    const route = jest.fn();
    gasket.config.express = { routes: [route] };
    await plugin.hooks.createServers(gasket, {});
    expect(route).toHaveBeenCalled();
  });

  it('allows for an array of route functions with async', async function () {
    const route = jest.fn();
    gasket.config.express = { routes: [async () => route()] };
    await plugin.hooks.createServers(gasket, {});
    expect(route).toHaveBeenCalled();
  });

  it('throws an error if a route is not a function', async function () {
    gasket.config.express = { routes: [1] };
    await expect(plugin.hooks.createServers(gasket, {})).rejects.toThrow(
      'Route must be a function'
    );
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
  });

  it('executes the `middleware` lifecycle before the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.execApply.mock.calls[0]).toContain('middleware');
    expect(gasket.exec.mock.calls[0]).toContain('express', app);
  });

  it('does not use empty middleware arrays', async function () {
    mockMwPlugins = [{ name: 'middleware-1' }, []];

    await plugin.hooks.createServers(gasket, {});

    expect(app.use).not.toHaveBeenCalledWith([]);
  });

  it('executes the `errorMiddleware` lifecycle after the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec.mock.calls[0]).toContain('express', app);
    expect(gasket.exec.mock.calls[1]).toContain('errorMiddleware');
  });

  it('adds the errorMiddleware', async () => {
    const errorMiddlewares = [jest.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await plugin.hooks.createServers(gasket, {});

    const errorMiddleware = findCall(
      app.use,
      (mw) => mw === errorMiddlewares[0]
    );
    expect(errorMiddleware).not.toBeNull();
  });

  it('adds the errorMiddleware after API routes', async () => {
    Object.assign(gasket.config, {
      root: __dirname,
      express: {
        root: __dirname,
        routes: []
      }
    });
    const errorMiddlewares = [jest.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await plugin.hooks.createServers(gasket, {});
    await setTimeout(10); // Make sure routes aren't added asynchronously

    const errorIndex = findCallIndex(
      app.use,
      (mw) => mw === errorMiddlewares[0]
    );

    expect(errorIndex).toEqual(app.use.mock.calls.length - 1);
  });

  it('setups up patch middleware for http2', async () => {
    gasket.config.http2 = 8080;
    await plugin.hooks.createServers(gasket, {});

    // Added as the first middleware
    const patchMiddleware = bridgedApp.use.mock.calls[0][0];
    expect(patchMiddleware).toHaveProperty('name', 'http2Patch');

    // attaches _implicitHeader to the response object
    const req = {};
    const res = {};
    const next = jest.fn();
    patchMiddleware(req, res, next);

    expect(res).toHaveProperty('_implicitHeader');
    expect(next).toHaveBeenCalled();
  });

  it('adds the cookie-parser middleware before plugin middleware', async () => {
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (mw) => mw === cookieParserMiddleware
    );
    expect(cookieParserUsage).not.toBeNull();

    // callId can be used to determine relative call ordering
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(
      gasket.exec.mock.invocationCallOrder[0]
    );
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(
      gasket.execApply.mock.invocationCallOrder[0]
    );
  });

  it('adds the cookie-parser middleware with a excluded path', async () => {
    gasket.config.express = { excludedRoutesRegex: /^(?!\/_next\/)/ };
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (url, mw) => mw === cookieParserMiddleware
    );
    expect(cookieParserUsage).not.toBeNull();
  });

  it('supports the deprecated property name', async () => {
    gasket.config.express = { middlewareInclusionRegex: /^(?!\/_next\/)/ };
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (url, mw) => mw === cookieParserMiddleware
    );
    expect(cookieParserUsage).not.toBeNull();
  });

  it('adds the compression middleware by default', async () => {
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      (mw) => mw === compressionMiddleware
    );
    expect(compressionUsage).not.toBeNull();
  });

  it('adds the compression middleware when enabled from gasket config', async () => {
    gasket.config.express = { compression: true };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      (mw) => mw === compressionMiddleware
    );
    expect(compressionUsage).not.toBeNull();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.express = { compression: false };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      (mw) => mw === compressionMiddleware
    );
    expect(compressionUsage).toBeNull();
  });

  it('adds middleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(4);

    app.use.mockClear();
    mockMwPlugins = [{ name: 'middlware-1' }, null];

    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(5);
  });

  it('supports async middleware hooks', async () => {
    const middleware = Symbol();
    gasket = new GasketEngine([
      plugin,
      {
        name: '@mock/gasket-plugin',
        hooks: {
          middleware: async () => middleware
        }
      }
    ]);

    gasket.config = {};

    await gasket.exec('createServers');

    const middlewares = app.use.mock.calls.flat();
    expect(middlewares).toContain(middleware);
  });

  it('middleware paths in the config are used', async () => {
    const paths = ['/home'];
    gasket.config.middleware = [
      {
        plugin: 'middlware-1',
        paths
      }
    ];
    mockMwPlugins = [{ name: 'middlware-1' }];
    await plugin.hooks.createServers(gasket, {});

    expect(app.use.mock.calls[4]).toContain(paths);
  });

  it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(4);
    lifecycles.errorMiddleware.mockResolvedValue([() => {
    }, null]);
    app.use.mockClear();
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(5);
  });

  it('attaches a logger to the request', async () => {
    const augmentedLogger = { info: jest.fn() };
    gasket.logger = { child: jest.fn().mockReturnValue(augmentedLogger) };
    await plugin.hooks.createServers(gasket, {});

    const req = {};
    const res = {};
    const next = jest.fn();

    app.use.mock.calls.forEach(([middleware]) => middleware(req, res, next));
    expect(req).toHaveProperty('logger', gasket.logger);

    req.logger.metadata({ userId: '123' });
    expect(gasket.logger.child).toHaveBeenCalledWith({ userId: '123' });

    req.logger.info('test');
    expect(augmentedLogger.info).toHaveBeenCalledWith('test');
  });

  it('does not enable trust proxy by default', async () => {
    await plugin.hooks.createServers(gasket, {});

    expect(app.set).not.toHaveBeenCalled();
  });

  it('does enable trust proxy by if set to true', async () => {
    gasket.config.express = { trustProxy: true };
    await plugin.hooks.createServers(gasket, {});

    expect(app.set).toHaveBeenCalledWith('trust proxy', true);
  });

  it('does enable trust proxy by if set to string', async () => {
    gasket.config.express = { trustProxy: '127.0.0.1' };
    await plugin.hooks.createServers(gasket, {});

    expect(app.set).toHaveBeenCalledWith('trust proxy', '127.0.0.1');
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = findCallIndex(aSpy, aPredicate);
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }

  function findCallIndex(aSpy, aPredicate) {
    return aSpy.mock.calls.map((args) => aPredicate(...args)).indexOf(true);
  }
});

describe('create', () => {
  let mockContext;

  function expectCreatedWith(assertFn) {
    return async function expectCreated() {
      await plugin.hooks.create({}, mockContext);
      assertFn(mockContext);
    };
  }

  beforeEach(() => {
    mockContext = {
      pkg: { add: jest.fn() },
      files: { add: jest.fn() },
      gasketConfig: {
        addPlugin: jest.fn(),
        add: jest.fn(),
        addImport: jest.fn().mockReturnThis(),
        injectValue: jest.fn()
      },
      apiApp: true
    };
  });

  it('adds itself to the dependencies',
    expectCreatedWith(({ pkg }) => {
      expect(pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({
          [name]: `^${version}`
        }));
    })
  );

  it(
    'adds appropriate dependencies',
    expectCreatedWith(({ pkg }) => {
      expect(pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({
          express: '^4.18.2'
        }));
    })
  );

  it('adds the appropriate files',
    expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.any(String));
    })
  );

  it('adds the plugin import to the gasket file',
    expectCreatedWith(({ gasketConfig }) => {
      expect(gasketConfig.addPlugin).toHaveBeenCalledWith('pluginExpress', name);
    })
  );

  it('add config to the gasket file',
    expectCreatedWith(({ gasketConfig }) => {
      expect(gasketConfig.add).toHaveBeenCalledWith('express', { routes: [] });
    })
  );
});
