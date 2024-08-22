const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockYamlSafeDumpStub = jest.fn();
const mockYamlSafeLoadStub = jest.fn().mockResolvedValue({ data: true });
const mockSwaggerJSDocStub = jest.fn();
const mockOKStub = jest.fn();
const mockAccessStub = jest.fn().mockResolvedValue();
const mockBuildSwaggerDefinition = jest.fn();

jest.mock('fs', () => ({
  constants: {
    F_OK: mockOKStub
  },
  promises: {
    readFile: mockReadFileStub,
    writeFile: mockWriteFileStub,
    access: mockAccessStub
  }
}));
jest.mock('../lib/build-swagger-definition', () => mockBuildSwaggerDefinition);
jest.mock('swagger-jsdoc', () => mockSwaggerJSDocStub);
jest.mock('js-yaml', () => ({
  safeDump: mockYamlSafeDumpStub,
  safeLoad: mockYamlSafeLoadStub
}));
jest.mock('util', () => {
  const mod = jest.requireActual('util');
  return {
    ...mod,
    promisify: (f) => f
  };
});

jest.mock('/path/to/app/swagger.json', () => ({ data: true }), {
  virtual: true
});

const { name, version, description } = require('../package');

describe('Swagger Plugin', function () {
  let plugin;

  beforeEach(() => {
    plugin = require('../lib/index');
  });

  afterEach(function () {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('is an object', function () {
    expect(typeof plugin).toBe('object');
    expect(Object.keys(plugin)).toHaveLength(4);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', function () {
    const expected = [
      'configure',
      'build',
      'express',
      'fastify',
      'create',
      'postCreate',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('configure hook', function () {
    it('sets expected defaults', function () {
      const results = plugin.hooks.configure({}, {});
      expect(results).toEqual({
        swagger: {
          definitionFile: 'swagger.json',
          apiDocsRoute: '/api-docs'
        }
      });
    });

    it('uses specified definitionFile', function () {
      const results = plugin.hooks.configure(
        {},
        {
          swagger: { definitionFile: 'dist/api-spec.yaml' }
        }
      );

      expect(results.swagger.definitionFile).toEqual('dist/api-spec.yaml');
    });

    it('uses specified apiDocsRoute', function () {
      const results = plugin.hooks.configure(
        {},
        {
          swagger: { apiDocsRoute: '/api/v2/docs' }
        }
      );

      expect(results.swagger.apiDocsRoute).toEqual('/api/v2/docs');
    });
  });

  describe('build hook', function () {
    let mockGasket;

    beforeEach(function () {
      mockGasket = {};
    });

    it('sets up swagger spec', async function () {
      await plugin.hooks.build(mockGasket);
      expect(mockBuildSwaggerDefinition).toHaveBeenCalled();
    });
  });

  describe('express hook', function () {
    let mockGasket, mockApp;

    beforeEach(function () {
      mockGasket = {
        logger: {
          info: jest.fn(),
          error: jest.fn()
        },
        config: {
          root: '/path/to/app',
          swagger: {
            definitionFile: 'swagger.json',
            apiDocsRoute: '/api-docs'
          }
        }
      };
      mockApp = {
        use: jest.fn()
      };
    });

    afterEach(function () {
      jest.clearAllMocks();
      jest.resetModules();
    });

    it('when target definition file is not found', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      const result = await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(result).toBeFalsy();
    });

    it('swagger file is missing, gasket.logger logs error', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      mockAccessStub.mockRejectedValueOnce();
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        `Missing ${mockGasket.config.swagger.definitionFile} file...`
      );
    });

    it('loads the swagger spec yaml file', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalled();
    });

    it('only loads the swagger spec file once', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
    });

    it('loads the swagger spec json file', async function () {
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
    });

    it('sets the api docs route', async function () {
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockApp.use.mock.calls[0][0]).toEqual('/api-docs');
    });
  });

  describe('fastify hook', function () {
    let mockGasket, mockApp;

    beforeEach(function () {
      mockGasket = {
        logger: {
          info: jest.fn(),
          error: jest.fn()
        },
        config: {
          root: '/path/to/app',
          swagger: {
            definitionFile: 'swagger.json',
            apiDocsRoute: '/api-docs'
          }
        }
      };
      mockApp = {
        register: jest.fn(),
        ready: jest.fn(),
        get: jest.fn()
      };
    });

    it('returns nothing when target definition file is not found', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      const result = await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(result).toBeFalsy();
    });

    it('swagger file is missing, gasket.logger logs error', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      mockAccessStub.mockRejectedValueOnce();
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        `Missing ${mockGasket.config.swagger.definitionFile} file...`
      );
    });

    it('loads the swagger spec yaml file', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalled();
    });

    it('only loads the swagger spec file once', async function () {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
    });

    it('loads the swagger spec json file', async function () {
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
    });

    it('sets the api docs route', async function () {
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledTimes(2);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), {
        routePrefix: '/api-docs'
      });
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), {
        swagger: { data: true }
      });
    });
  });

  describe('create hook', function () {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        pkg: {
          add: jest.fn()
        },
        gasketConfig: {
          addPlugin: jest.fn(),
          add: jest.fn()
        }
      };
    });

    it('adds itself to the dependencies', async function () {
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({
          [name]: `^${version}`
        })
      );
    });

    it('adds build script', async function () {
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts',
        expect.objectContaining({
          build: 'node gasket.js build'
        })
      );
    });

    it('does not add build script if typescript', async function () {
      mockContext.typescript = true;
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.pkg.add).not.toHaveBeenCalledWith('scripts',
        expect.objectContaining({
          build: 'node gasket.js build'
        })
      );
    });

    it('adds swagger plugin to gasket config', async function () {
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginSwagger', name);
    });

    it('adds swagger config to gasket config', async function () {
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.gasketConfig.add).toHaveBeenCalledWith('swagger', expect.any(Object));
    });
  });
});
