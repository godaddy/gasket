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

const mockSwaggerUiServe = vi.fn();
const mockSwaggerUiSetup = vi.fn().mockReturnValue(vi.fn());
vi.mock('swagger-ui-express', () => ({
  default: {
    serve: mockSwaggerUiServe,
    setup: mockSwaggerUiSetup
  }
}));

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
          mode: 'static',
          definitionFile: 'swagger.json',
          apiDocsRoute: '/api-docs'
        }
      });
    });

    it('defaults mode to "static" when not specified', function () {
      const results = plugin.hooks.configure({}, { swagger: {} });
      expect(results.swagger.mode).toEqual('static');
    });

    it('preserves mode when explicitly set', function () {
      const results = plugin.hooks.configure({}, { swagger: { mode: 'introspect' } });
      expect(results.swagger.mode).toEqual('introspect');
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
      mockGasket = { config: { swagger: {} } };
    });

    it('sets up swagger spec', async function () {
      await plugin.hooks.build(mockGasket);
      expect(mockBuildSwaggerDefinition).toHaveBeenCalled();
    });

    it('skips buildSwaggerDefinition when mode is introspect', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      await plugin.hooks.build(mockGasket);
      expect(mockBuildSwaggerDefinition).not.toHaveBeenCalled();
    });

    it('runs buildSwaggerDefinition when mode is static', async function () {
      mockGasket.config.swagger.mode = 'static';
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
          error: vi.fn(),
          warn: vi.fn()
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

    it('logs warning and skips when mode is introspect', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.mode "introspect" is only supported with Fastify. ' +
        'Skipping Swagger UI for Express. To use Swagger with Express, use mode "static".'
      );
      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('logs warning when swagger.spec is set in static mode', async function () {
      mockGasket.config.swagger.spec = { info: { title: 'Test', version: '1.0.0' } };
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.spec is only used when swagger.mode is "introspect". ' +
        'It has no effect in static mode.'
      );
    });
  });

  describe('fastify hook', function () {
    let mockGasket, mockApp;

    beforeEach(function () {
      mockGasket = {
        logger: {
          info: vi.fn(),
          error: vi.fn(),
          warn: vi.fn()
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

    it('introspect mode: registers @fastify/swagger with openapi key when no version in spec', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      const spec = { info: { title: 'Test API', version: '1.0.0' } };
      mockGasket.config.swagger.spec = spec;
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { openapi: spec });
    });

    it('introspect mode: registers with empty spec object when swagger.spec is not set', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { openapi: {} });
    });

    it('introspect mode: uses swagger key when spec.swagger is set (Swagger 2.0)', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      const spec = { swagger: '2.0', info: { title: 'Test API', version: '1.0.0' } };
      mockGasket.config.swagger.spec = spec;
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { swagger: spec });
    });

    it('introspect mode: does not load swagger spec file', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockAccessStub).not.toHaveBeenCalled();
      expect(mockReadFileStub).not.toHaveBeenCalled();
    });

    it('introspect mode: still registers @fastify/swagger-ui with apiDocsRoute', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), {
        routePrefix: '/api-docs'
      });
    });

    it('introspect mode: warns when jsdoc is also set', async function () {
      mockGasket.config.swagger.mode = 'introspect';
      mockGasket.config.swagger.jsdoc = { definition: { info: { title: 'Test', version: '1.0.0' } } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.jsdoc is ignored when swagger.mode is "introspect". ' +
        'Route introspection discovers routes automatically.'
      );
    });

    it('logs warning when swagger.spec is set in static mode', async function () {
      mockGasket.config.swagger.spec = { info: { title: 'Test', version: '1.0.0' } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.spec is only used when swagger.mode is "introspect". ' +
        'It has no effect in static mode.'
      );
    });

    it('static mode: uses openapi key when loaded file has openapi property (OpenAPI 3.x)', async function () {
      const openapiSpec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };
      mockYamlSafeLoadStub.mockReturnValueOnce(openapiSpec);
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), {
        openapi: openapiSpec
      });
    });
  });

  describe('create hook', function () {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        pkg: {
          add: vi.fn()
        },
        readme: {
          subHeading: vi.fn().mockReturnThis(),
          content: vi.fn().mockReturnThis(),
          link: vi.fn().mockReturnThis()
        },
        gasketConfig: {
          addPlugin: vi.fn(),
          add: vi.fn()
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

    it('adds to the readme', async function () {
      await plugin.hooks.create({}, mockContext);
      expect(mockContext.readme.link)
        .toHaveBeenCalledWith('swagger-jsdoc', 'https://github.com/Surnet/swagger-jsdoc/');
      expect(mockContext.readme.link)
        .toHaveBeenCalledWith('swagger.json', '/swagger.json');
      expect(mockContext.readme.content).toHaveBeenCalledWith(
        'Use `@swagger` JSDocs to automatically generate the [swagger.json] spec file. Visit [swagger-jsdoc] for examples.'
      );
      expect(mockContext.readme.subHeading).toHaveBeenCalledWith('Definitions');
    });
  });
});
