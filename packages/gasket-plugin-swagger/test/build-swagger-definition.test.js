const buildSwaggerDefinition = require('../lib/build-swagger-definition');
const swaggerJSDoc = require('swagger-jsdoc');
const { writeFile } = require('fs').promises;

jest.mock('fs', () => ({
  constants: {
    F_OK: jest.fn()
  },
  promises: {
    writeFile: jest.fn()
  }
}));

jest.mock('swagger-jsdoc', () => {
  return jest.fn();
});

const mockSafeDump = jest.fn();
jest.mock('js-yaml', () => {
  return { safeDump: mockSafeDump };
});

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

describe('build-swagger-definition', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      logger: {
        info: jest.fn(),
        warn: jest.fn()
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

  afterEach(function () {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('sets up swagger spec', async function () {
    await buildSwaggerDefinition(mockGasket);
    expect(swaggerJSDoc).toHaveBeenCalled();
  });

  it('writes spec file', async function () {
    swaggerJSDoc.mockReturnValue({ data: true });
    await buildSwaggerDefinition(mockGasket);
    expect(writeFile).toHaveBeenCalledWith(
      '/path/to/app/swagger.json',
      expect.any(String),
      'utf8'
    );
  });

  it('json content for .json definition files', async function () {
    swaggerJSDoc.mockReturnValue({ data: true });
    await buildSwaggerDefinition(mockGasket);
    expect(writeFile.mock.calls[0][1]).toContain('"data": true');
  });

  it('yaml content for .yaml definition files', async function () {
    swaggerJSDoc.mockReturnValue({ data: true });
    mockGasket.config.swagger.definitionFile = 'swagger.yaml';
    mockSafeDump.mockReturnValue('- data: true');
    await buildSwaggerDefinition(mockGasket);
    expect(writeFile.mock.calls[0][1]).toContain('- data: true');
  });

  it('does not setup swagger spec if not configured', async function () {
    delete mockGasket.config.swagger.jsdoc;
    await buildSwaggerDefinition(mockGasket);
    expect(swaggerJSDoc).not.toHaveBeenCalled();
  });

  it('uses the options object\'s root and swagger properties', async function () {
    const options = {
      root: 'path/to/root/from/options',
      swagger: {
        definitionFile: 'swagger-options.json',
        jsdoc: {
          definition: {
            openapi: '3.0.0-options'
          },
          apis: ['fake-options.js']
        }
      }
    };
    await buildSwaggerDefinition(mockGasket, options);
    expect(writeFile).toHaveBeenCalledWith(
      'path/to/root/from/options/swagger-options.json',
      expect.any(String),
      'utf8'
    );
    expect(swaggerJSDoc).toHaveBeenCalledWith(options.swagger.jsdoc);
  });
});
