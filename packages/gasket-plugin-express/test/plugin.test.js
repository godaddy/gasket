/* eslint-disable jsdoc/require-jsdoc */
const { setTimeout } = require('timers/promises');
const { devDependencies } = require('../package.json');
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
const { name, version, description } = require('../package');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
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
      actions: {
        getExpressApp: jest.fn().mockReturnValue(app)
      },
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
    gasket.actions.getExpressApp.mockReturnValueOnce(bridgedApp);
    gasket.config.http2 = 8080;
    const result = await plugin.hooks.createServers(gasket);
    expect(result).toEqual({ handler: bridgedApp });
  });

  it('executes the `express` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('express', app);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await plugin.hooks.createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
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
        addPlugin: jest.fn()
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
          express: devDependencies.express
        }));
    })
  );

  it('adds the appropriate files', async () => {
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.any(String));
  });

  it('ignores route files if disabled', async () => {
    mockContext.addApiRoutes = false;
    await plugin.hooks.create({}, mockContext);
    expect(mockContext.files.add).not.toHaveBeenCalled();
  });

  it('adds the plugin import to the gasket file',
    expectCreatedWith(({ gasketConfig }) => {
      expect(gasketConfig.addPlugin).toHaveBeenCalledWith('pluginExpress', name);
    })
  );

  it('respects the typescript flag', async () => {
    mockContext.typescript = false;
    await expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('../generator/app/**/!(*.ts|*.json)'));
    })();
    mockContext.typescript = true;
    await expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('../generator/app/**/!(*.js)'));
    })();
  });

  describe('createTestFiles', () => {
    let mockTestPlugins;
    beforeEach(() => {
      mockTestPlugins = [];

      mockContext.testPlugins = mockTestPlugins;
      mockContext.typescript = false;
    });

    afterEach(() => {
      delete mockContext.testPlugins;
    });

    it('adds mocha files', async function () {
      mockContext.testPlugins = ['@gasket/mocha'];
      await expectCreatedWith(({ files }) => {
        expect(files.add).toHaveBeenCalledWith(
          expect.stringContaining(`/generator/mocha/*/!(*.ts|*.json)`),
          expect.stringContaining(`/generator/mocha/**/!(*.ts|*.json)`)
        );
      })();
    });

    it('adds jest files', async function () {
      mockContext.testPlugins = ['@gasket/jest'];
      await expectCreatedWith(({ files }) => {
        expect(files.add).toHaveBeenCalledWith(
          expect.stringContaining(`/generator/jest/*/!(*.ts|*.json)`),
          expect.stringContaining(`/generator/jest/**/!(*.ts|*.json)`)
        );
      })();
    });

    it('adds cypress files', async function () {
      mockContext.testPlugins = ['@gasket/cypress'];
      await expectCreatedWith(({ files }) => {
        expect(files.add).toHaveBeenCalledWith(
          expect.stringContaining(`/generator/cypress/*`),
          expect.stringContaining(`/generator/cypress/**/*`)
        );
      })();
    });

    it('adds ts extenstion files', async function () {
      mockContext.typescript = true;
      mockContext.testPlugins = ['@gasket/jest'];
      await expectCreatedWith(({ files }) => {
        expect(files.add).toHaveBeenCalledWith(
          expect.stringContaining(`/generator/jest/*/!(*.js)`),
          expect.stringContaining(`/generator/jest/**/!(*.js)`)
        );
      })();
    });

    it('adds no files for no test plugins', async function () {
      mockContext.testPlugins = [];
      await expectCreatedWith(({ files }) => {
        expect(files.add).not.toHaveBeenCalledWith(
          expect.stringContaining(`/generator/jest/*/!(*.js)`),
          expect.stringContaining(`/generator/jest/**/!(*.js)`)
        );
      })();
    });
  });
});
