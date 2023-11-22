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
      'build',
      'configure',
      'create',
      'express',
      'fastify',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = new Set(Object.keys(plugin.hooks));
    expect(hooks.size).toEqual(expected.length);

    for (const hook of expected) {
      expect(hooks).toContain(hook);
    }
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
});
