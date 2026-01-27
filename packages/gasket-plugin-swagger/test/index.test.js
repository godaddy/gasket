/* eslint-disable no-undefined */
import { vi } from 'vitest';

const mockReadFileStub = vi.fn().mockResolvedValue('yaml content');
const mockWriteFileStub = vi.fn();
const mockYamlSafeDumpStub = vi.fn();
const mockYamlSafeLoadStub = vi.fn().mockReturnValue({ data: true });
const mockSwaggerJSDocStub = vi.fn();
const mockAccessStub = vi.fn().mockResolvedValue();
const mockBuildSwaggerDefinition = vi.fn();

vi.mock('fs/promises', () => ({
  readFile: mockReadFileStub,
  writeFile: mockWriteFileStub,
  access: mockAccessStub
}));
vi.mock('../lib/build-swagger-definition.js', () => ({ default: mockBuildSwaggerDefinition }));
vi.mock('swagger-jsdoc', () => ({ default: mockSwaggerJSDocStub }));
// Mock the dynamic import for js-yaml
vi.mock('js-yaml', async () => {
  return {
    default: {
      safeDump: mockYamlSafeDumpStub,
      safeLoad: mockYamlSafeLoadStub
    }
  };
});
vi.mock('util', () => {
  const mod = vi.importActual('util');
  return {
    ...mod,
    promisify: (f) => f
  };
});

vi.mock('/path/to/app/swagger.json', () => ({ data: true }), {
  virtual: true
});

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Swagger Plugin', function () {
  let plugin;

  beforeEach(async () => {
    const module = await import('../lib/index.js');
    plugin = module.default;
  });

  afterEach(function () {
    vi.clearAllMocks();
    vi.resetModules();
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
          info: vi.fn(),
          error: vi.fn()
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
        use: vi.fn()
      };
    });

    afterEach(function () {
      vi.clearAllMocks();
      vi.resetModules();
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
          info: vi.fn(),
          error: vi.fn()
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
        register: vi.fn(),
        ready: vi.fn(),
        get: vi.fn()
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
        swagger: undefined
      });
    });
  });
});
