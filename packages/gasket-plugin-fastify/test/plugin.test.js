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
    mockMwPlugins = [];

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
        for (let i = 0; i < mockMwPlugins.length; i++) {
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

  it('executes the `fastify` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('fastify', app);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
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

  // it('adds errorMiddleware from lifecycle (ignores falsy)', async () => {
  //   await plugin.hooks.createServers(gasket, {});
  //   expect(app.use).toHaveBeenCalledTimes(3);

  //   app.use.mockClear();
  //   lifecycles.errorMiddleware.mockResolvedValue([() => {
  //   }, null]);

  //   await plugin.hooks.createServers(gasket, {});
  //   expect(app.use).toHaveBeenCalledTimes(4);
  // });

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

describe('create', () => {
  let mockContext;

  /**
   * Factory to create an async expect function
   * @param assertFn
   * @returns {function(): Promise<void>}
   */
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
