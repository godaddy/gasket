const GasketEngine = require('@gasket/engine');
const app = { use: jest.fn() };
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

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin.name).toBe(require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'createServers',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});

// eslint-disable-next-line max-statements
describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;
  const sandbox = jest.fn();

  beforeEach(() => {
    mockMwPlugins =  [];

    lifecycles = {
      middleware: jest.fn().mockResolvedValue([]),
      errorMiddleware: jest.fn().mockResolvedValue([]),
      express: jest.fn().mockResolvedValue()
    };

    gasket = {
      middleware: {},
      logger: {},
      config: {},
      exec: jest.fn().mockImplementation((lifecycle, ...args) => lifecycles[lifecycle](args)),
      execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
        for (let i = 0; i <  mockMwPlugins.length; i++) {
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
    expect(gasket.execApply).toHaveBeenCalledWith('middleware', expect.any(Function));
  });

  it('executes the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('express', app);
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
      (mw) => mw === errorMiddlewares[0]);
    expect(errorMiddleware).not.toBeNull();
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
      (mw) => mw === cookieParserMiddleware);
    expect(cookieParserUsage).not.toBeNull();

    // callId can be used to determine relative call ordering
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(gasket.exec.mock.invocationCallOrder[0]);
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(gasket.execApply.mock.invocationCallOrder[0]);
  });

  it('adds the cookie-parser middleware with a excluded path', async () => {
    gasket.config.express = { excludedRoutesRegex: /^(?!\/_next\/)/ };
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (path, mw) => mw === cookieParserMiddleware);
    expect(cookieParserUsage).not.toBeNull();
  });

  it('adds the compression middleware by default', async () => {
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    expect(compressionUsage).not.toBeNull();
  });

  it('adds the compression middleware when enabled from gasket config', async () => {
    gasket.config.express = { compression: true };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw =>  mw === compressionMiddleware);
    expect(compressionUsage).not.toBeNull();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.express = { compression: false };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    expect(compressionUsage).toBeNull();
  });

  it('adds middleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(2);

    app.use.mockClear();
    mockMwPlugins = [
      { name: 'middlware-1' },
      null
    ];

    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(3);
  });

  it('supports async middleware hooks', async () => {
    const middleware = Symbol();
    gasket = new GasketEngine({
      plugins: {
        add: [
          plugin,
          {
            name: '@mock/gasket-plugin',
            hooks: {
              middleware: async () => middleware
            }
          }
        ]
      }
    });

    await gasket.exec('createServers');

    const middlewares = app.use.mock.calls.flat();
    expect(middlewares).toContain(middleware);
  });

  it('middleware paths in the config are used', async () => {
    const paths = ['/home'];
    gasket.config.middleware = [{
      plugin: 'middlware-1',
      paths
    }];
    mockMwPlugins = [
      { name: 'middlware-1' }
    ];
    await plugin.hooks.createServers(gasket, {});

    expect(app.use.mock.calls[2]).toContain(paths);
  });

  it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(2);
    lifecycles.errorMiddleware.mockResolvedValue([() => {}, null]);
    app.use.mockClear();
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(3);
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = aSpy.mock.calls.map(args => aPredicate(...args)).indexOf(true);
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
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
      files: { add: jest.fn() }
    };
  });

  it('adds appropriate dependencies', expectCreatedWith(({ pkg }) => {
    expect(pkg.add).toHaveBeenCalledWith('dependencies', {
      express: '^4.16.3'
    });
  }));
});
