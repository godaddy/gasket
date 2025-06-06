const { name, version, devDependencies } = require('../package.json');
const createHook = require('../lib/create.js');

describe('create', () => {
  let mockContext;

  function expectCreatedWith(assertFn) {
    return async function expectCreated() {
      await createHook({}, mockContext);
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
    await createHook({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.any(String));
  });

  it('ignores route files if disabled', async () => {
    mockContext.addApiRoutes = false;
    await createHook({}, mockContext);
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
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('../generator/app/**/'));
    })();
    mockContext.typescript = true;
    await expectCreatedWith(({ files }) => {
      expect(files.add).toHaveBeenCalledWith(expect.stringContaining('../generator/app/**/!(*.ts)'));
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
          expect.stringContaining(`/generator/mocha/*`),
          expect.stringContaining(`/generator/mocha/**/!(*.ts)`)
        );
      })();
    });

    it('adds jest files', async function () {
      mockContext.testPlugins = ['@gasket/jest'];
      await expectCreatedWith(({ files }) => {
        expect(files.add).toHaveBeenCalledWith(
          expect.stringContaining(`/generator/jest/*`),
          expect.stringContaining(`/generator/jest/**/!(*.ts)`)
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
