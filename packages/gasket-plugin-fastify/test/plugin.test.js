/* eslint-disable jsdoc/require-jsdoc */
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
const { name, version, description } = require('../package');

describe('Plugin', function () {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
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
      actions: {
        getFastifyApp: jest.fn().mockReturnValue(app)
      },
      middleware: {},
      logger: {},
      config: {
        fastify: {}
      },
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

  describe('actions', () => {
    it('should return app from getFastifyApp action', () => {
      const actions = plugin.actions;
      expect(actions.getFastifyApp(gasket)).toBe(app);
    });

    it('does not enable trust proxy by default', async () => {
      const actions = plugin.actions;
      await actions.getFastifyApp(gasket);
      expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: false });
    });

    it('does enable trust proxy by if set to true', async () => {
      gasket.config.fastify = { trustProxy: true };
      const actions = plugin.actions;
      await actions.getFastifyApp(gasket);

      expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: true });
    });

    it('does enable trust proxy by if set to string', async () => {
      gasket.config.fastify = { trustProxy: '127.0.0.1' };
      const actions = plugin.actions;
      await actions.getFastifyApp(gasket);

      expect(mockFastify).toHaveBeenCalledWith({
        logger: gasket.logger,
        trustProxy: '127.0.0.1'
      });
    });

    it('adds log plugin as logger to fastify', async function () {
      const actions = plugin.actions;
      await actions.getFastifyApp(gasket);

      expect(mockFastify).toHaveBeenCalledWith({ logger: gasket.logger, trustProxy: false });
    });
  });

  it('returns the handler app', async function () {
    const result = await plugin.hooks.createServers(gasket, {});
    expect(result.handler).toEqual(expect.any(Function));

    const request = { mock: 'request' };
    await result.handler(request);

    expect(app.ready).toHaveBeenCalled();
    expect(app.server.emit).toHaveBeenCalledWith('request', request);
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
          fastify: '^4.28.1'
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
      expect(gasketConfig.addPlugin).toHaveBeenCalledWith('pluginFastify', name);
    })
  );

  it('respects the typescript flag', async () => {
    mockContext.typescript = false;
    expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('.js'));
    });
    mockContext.typescript = true;
    expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('.ts'));
    });
  });
});
