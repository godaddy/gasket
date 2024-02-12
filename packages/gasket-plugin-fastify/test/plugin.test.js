const middie = require('middie');
const GasketEngine = require('@gasket/engine');
const version = require('../package.json').peerDependencies.fastify;

const app = {
  ready: jest.fn(),
  server: {
    emit: jest.fn()
  },
  register: jest.fn(),
  use: jest.fn()
};

const mockFastify = jest.fn().mockReturnValue(app);
const cookieParserMiddleware = jest.fn();
const compressionMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);


jest.mock('fastify', () => mockFastify);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);

const plugin = require('../lib/index');

describe('Plugin', function () {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'createServers',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

// eslint-disable-next-line max-statements
describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMwPlugins =  [];

    lifecycles = {
      middleware: jest.fn().mockResolvedValue([]),
      errorMiddleware: jest.fn().mockResolvedValue([]),
      fastify: jest.fn().mockResolvedValue()
    };

    gasket = {
      middleware: {},
      logger: {},
      config: {},
      exec: jest.fn().mockImplementation((lifecycle, ...args) => lifecycles[lifecycle](args)),
      execApply: jest.fn(async function (lifecycle, fn) {
        for (let i = 0; i <  mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return jest.fn();
      })
    };
  });

  it('returns the handler app', async function () {
    const result = await plugin.hooks.createServers(gasket, {});
    expect(result.handler).toEqual(expect.any(Function));

    const request = { mock: 'request' };
    await result.handler(request);

    expect(app.ready).toHaveBeenCalled();
    expect(app.server.emit).toHaveBeenCalledWith('request', request);
  });

  it('adds log plugin as logger to fastify', async function () {
    await plugin.hooks.createServers(gasket, {});

    expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: false });
  });

  it('executes the `middleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.execApply).toHaveBeenCalledWith('middleware', expect.any(Function));
  });

  it('executes the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('fastify', app);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
  });

  it('executes the `middleware` lifecycle before the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.execApply.mock.calls[0]).toContain('middleware');
    expect(gasket.exec.mock.calls[0]).toContain('fastify', app);
  });

  it('executes the `errorMiddleware` lifecycle after the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec.mock.calls[0]).toContain('fastify', app);
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

  it('registers the middie middleware plugin', async () => {
    await plugin.hooks.createServers(gasket, {});

    expect(app.register).toHaveBeenCalledWith(middie);
  });

  it('adds middleware to attach res.locals', async () => {
    await plugin.hooks.createServers(gasket, {});

    const middleware = app.use.mock.calls[0][0];
    expect(middleware.name).toEqual('attachLocals');

    const res = {};
    const next = jest.fn();
    middleware({}, res, next);

    expect(res).toHaveProperty('locals');
    expect(res.locals).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('adds the cookie-parser middleware before plugin middleware', async () => {
    await plugin.hooks.createServers(gasket, {});

    const cookieParserUsage = findCall(
      app.use,
      (mw) => mw === cookieParserMiddleware);
    expect(cookieParserUsage).not.toBeNull();

    // invocationCallOrder can be used to determine relative call ordering
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(gasket.exec.mock.invocationCallOrder[0]);
    expect(mockCookieParser.mock.invocationCallOrder[0]).toBeLessThan(gasket.execApply.mock.invocationCallOrder[0]);
  });

  it('adds the cookie-parser middleware with a excluded path', async () => {
    gasket.config.fastify = { excludedRoutesRegex: /^(?!\/_next\/)/ };
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
    gasket.config.fastify = { compression: true };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    expect(compressionUsage).not.toBeNull();
  });

  it('does not add the compression middleware when disabled from gasket config', async () => {
    gasket.config.fastify = { compression: false };
    await plugin.hooks.createServers(gasket, {});

    const compressionUsage = findCall(
      app.use,
      mw => mw === compressionMiddleware);
    expect(compressionUsage).toBeNull();
  });

  it('adds middleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(3);

    app.use.mockClear();
    mockMwPlugins = [
      { name: 'middlware-1' },
      null
    ];

    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(4);
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
    expect(app.use.mock.calls[app.use.mock.calls.length - 1]).toContain(paths);
  });

  it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(3);

    app.use.mockClear();
    lifecycles.errorMiddleware.mockResolvedValue([() => {}, null]);

    await plugin.hooks.createServers(gasket, {});
    expect(app.use).toHaveBeenCalledTimes(4);
  });

  it('does not enable trust proxy by default', async () => {
    await plugin.hooks.createServers(gasket, {});

    expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: false });
  });

  it('does enable trust proxy by if set to true', async () => {
    gasket.config.fastify = { trustProxy: true };
    await plugin.hooks.createServers(gasket, {});

    expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: true });
  });

  it('does enable trust proxy by if set to string', async () => {
    gasket.config.fastify = { trustProxy: '127.0.0.1' };
    await plugin.hooks.createServers(gasket, {});

    expect(mockFastify).toHaveBeenCalledWith({
      logger: gasket.logger,
      trustProxy: '127.0.0.1'
    });
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
      fastify: version
    });
  }));
});
