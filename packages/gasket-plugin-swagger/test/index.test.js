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
      mockGasket = { config: { swagger: {} } };
    });

    it('sets up swagger spec', async function () {
      await plugin.hooks.build(mockGasket);
      expect(mockBuildSwaggerDefinition).toHaveBeenCalled();
    });

    it('skips buildSwaggerDefinition when introspect is set', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test', version: '1.0.0' } };
      await plugin.hooks.build(mockGasket);
      expect(mockBuildSwaggerDefinition).not.toHaveBeenCalled();
    });

    it('runs buildSwaggerDefinition when introspect is not set', async function () {
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

    it('logs warning and skips when introspect is set', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test', version: '1.0.0' } };
      await plugin.hooks.express.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.introspect is only supported with Fastify. ' +
        'Skipping Swagger UI for Express. To use Swagger with Express, remove swagger.introspect.'
      );
      expect(mockApp.use).not.toHaveBeenCalled();
    });
  });

  // eslint-disable-next-line max-statements
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

    it('introspect: registers @fastify/swagger with openapi key when no swagger version in object', async function () {
      const introspect = { info: { title: 'Test API', version: '1.0.0' } };
      mockGasket.config.swagger.introspect = introspect;
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { openapi: introspect });
    });

    it('introspect: uses swagger key when introspect.swagger is set (Swagger 2.0)', async function () {
      const introspect = { swagger: '2.0', info: { title: 'Test API', version: '1.0.0' } };
      mockGasket.config.swagger.introspect = introspect;
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { swagger: introspect });
    });

    it('introspect: does not load swagger spec file', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test API', version: '1.0.0' } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockAccessStub).not.toHaveBeenCalled();
      expect(mockReadFileStub).not.toHaveBeenCalled();
    });

    it('introspect: still registers @fastify/swagger-ui with apiDocsRoute', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test API', version: '1.0.0' } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), {
        routePrefix: '/api-docs'
      });
    });

    it('introspect: warns when jsdoc is also set', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test API', version: '1.0.0' } };
      mockGasket.config.swagger.jsdoc = { definition: { info: { title: 'Test', version: '1.0.0' } } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.jsdoc is ignored when swagger.introspect is set. ' +
        'Route introspection discovers routes automatically.'
      );
    });

    it('introspect: throws when introspect is not a plain object', async function () {
      mockGasket.config.swagger.introspect = true;
      await expect(plugin.hooks.fastify.handler(mockGasket, mockApp)).rejects.toThrow(
        'swagger.introspect must be a plain object'
      );
    });

    it('introspect: throws when introspect is an array', async function () {
      mockGasket.config.swagger.introspect = [];
      await expect(plugin.hooks.fastify.handler(mockGasket, mockApp)).rejects.toThrow(
        'swagger.introspect must be a plain object'
      );
    });

    it('introspect: strips routes from introspectMeta before passing to @fastify/swagger', async function () {
      const info = { title: 'Test API', version: '1.0.0' };
      mockGasket.config.swagger.introspect = { routes: { include: ['/api/v1'] }, info };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockApp.register).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ openapi: { info } })
      );
      const [, opts] = mockApp.register.mock.calls[0];
      expect(opts.openapi).not.toHaveProperty('routes');
    });

    it('introspect: adds transform when routes.include is set', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { include: ['/api/v1'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      expect(typeof opts.transform).toBe('function');
    });

    it('introspect: adds transform when routes.exclude is set', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { exclude: ['/internal'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      expect(typeof opts.transform).toBe('function');
    });

    it('introspect: does not add transform when no routes config', async function () {
      mockGasket.config.swagger.introspect = { info: { title: 'Test API', version: '1.0.0' } };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      expect(opts.transform).toBeUndefined();
    });

    it('introspect: transform passes through routes matching include prefix', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { include: ['/api/v1'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      const schema = { description: 'test' };
      expect(opts.transform({ schema, url: '/api/v1/users' })).toEqual({ schema, url: '/api/v1/users' });
    });

    it('introspect: transform hides routes not matching include prefix', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { include: ['/api/v1'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      const schema = { description: 'test' };
      expect(opts.transform({ schema, url: '/api/auth/validate' })).toEqual({
        schema: { hide: true },
        url: '/api/auth/validate'
      });
    });

    it('introspect: transform hides routes matching exclude prefix', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { exclude: ['/internal'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      const schema = { description: 'test' };
      expect(opts.transform({ schema, url: '/internal/health' })).toEqual({
        schema: { hide: true },
        url: '/internal/health'
      });
    });

    it('introspect: transform passes through routes not matching exclude prefix', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { exclude: ['/internal'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      const schema = { description: 'test' };
      expect(opts.transform({ schema, url: '/api/v1/users' })).toEqual({ schema, url: '/api/v1/users' });
    });

    it('introspect: transform applies both include and exclude', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { include: ['/api/v1'], exclude: ['/api/v1/internal'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      const [, opts] = mockApp.register.mock.calls[0];
      const schema = { description: 'test' };
      expect(opts.transform({ schema, url: '/api/v1/users' })).toEqual({ schema, url: '/api/v1/users' });
      expect(opts.transform({ schema, url: '/api/v1/internal/secret' })).toEqual({
        schema: { hide: true },
        url: '/api/v1/internal/secret'
      });
      expect(opts.transform({ schema, url: '/api/auth/validate' })).toEqual({
        schema: { hide: true },
        url: '/api/auth/validate'
      });
    });

    it('introspect: warns when include prefix is missing leading slash', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { include: ['api/v1'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.introspect.routes.include entry "api/v1" does not start with "/" ' +
        'and will never match a Fastify route URL.'
      );
    });

    it('introspect: warns when exclude prefix is missing leading slash', async function () {
      mockGasket.config.swagger.introspect = {
        routes: { exclude: ['internal'] },
        info: { title: 'Test API', version: '1.0.0' }
      };
      await plugin.hooks.fastify.handler(mockGasket, mockApp);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        'swagger.introspect.routes.exclude entry "internal" does not start with "/" ' +
        'and will never match a Fastify route URL.'
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
