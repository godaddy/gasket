const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockYamlSafeDumpStub = jest.fn();
const mockYamlSafeLoadStub = jest.fn().mockResolvedValue({ data: true });
const mockSwaggerJSDocStub = jest.fn();
const mockOKStub = jest.fn();
const mockAccessStub = jest.fn().mockResolvedValue();

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
jest.mock('/path/to/app/swagger.json', () => ({ data: true }), { virtual: true });

const fastify = require('fastify')({ logger: true });

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
    expect(Object.keys(plugin)).toHaveLength(2);
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', '@gasket/plugin-swagger');
  });

  it('has expected hooks', function () {
    const expected = [
      'configure',
      'build',
      'express',
      'fastify',
      'create',
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
      expect(results)
        .toEqual({
          swagger: {
            definitionFile: 'swagger.json',
            apiDocsRoute: '/api-docs'
          }
        });
    });

    it('uses specified definitionFile', function () {
      const results = plugin.hooks.configure({}, {
        swagger: { definitionFile: 'dist/api-spec.yaml' }
      });

      expect(results.swagger.definitionFile).toEqual('dist/api-spec.yaml');
    });

    it('uses specified apiDocsRoute', function () {
      const results = plugin.hooks.configure({}, {
        swagger: { apiDocsRoute: '/api/v2/docs' }
      });

      expect(results.swagger.apiDocsRoute).toEqual('/api/v2/docs');
    });
  });

  describe('build hook', function () {
    let mockGasket;

    beforeEach(function () {
      mockGasket = {
        logger: {
          info: jest.fn(),
          warning: jest.fn()
        },
        config: {
          root: '/path/to/app',
          swagger: {
            definitionFile: 'swagger.json',
            jsdoc: {
              definition: {
                openapi: '3.0.0'
              },
              apis: ['fake.js']
            }
          }
        }
      };
    });

    it('sets up swagger spec', async function () {
      await plugin.hooks.build(mockGasket);
      expect(mockSwaggerJSDocStub).toHaveBeenCalled();
    });

    it('writes spec file', async function () {
      mockSwaggerJSDocStub.mockReturnValue({ data: true });
      await plugin.hooks.build(mockGasket);
      expect(mockWriteFileStub).toHaveBeenCalledWith('/path/to/app/swagger.json', expect.any(String), 'utf8');
    });

    it('json content for .json definition files', async function () {
      mockSwaggerJSDocStub.mockReturnValue({ data: true });
      await plugin.hooks.build(mockGasket);
      expect(mockWriteFileStub.mock.calls[0][1]).toContain('"data": true');
    });

    it('yaml content for .yaml definition files', async function () {
      mockSwaggerJSDocStub.mockReturnValue({ data: true });
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      mockYamlSafeDumpStub.mockReturnValue('- data: true');
      await plugin.hooks.build(mockGasket);
      expect(mockWriteFileStub.mock.calls[0][1]).toContain('- data: true');
    });

    it('does not setup swagger spec if not configured', async function () {
      delete mockGasket.config.swagger.jsdoc;
      await plugin.hooks.build(mockGasket);
      expect(mockSwaggerJSDocStub).not.toHaveBeenCalled();
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
      expect(mockGasket.logger.error).toHaveBeenCalledWith(`Missing ${mockGasket.config.swagger.definitionFile} file...`);
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
      expect(mockGasket.logger.error).toHaveBeenCalledWith(`Missing ${mockGasket.config.swagger.definitionFile} file...`);
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
      expect(mockApp.register).toHaveBeenCalledWith(
        expect.any(Function),
        {
          prefix: '/api-docs',
          swagger: { data: true },
          uiConfig: {}
        }
      );
    });

    it('adds new routes to swagger paths', async function () {
      await plugin.hooks.fastify.handler(mockGasket, fastify);
      fastify.get('/hello-world', () => {});
      await fastify.ready();
      expect(fastify.swagger().paths).toHaveProperty('/hello-world');
    });
  });
});
