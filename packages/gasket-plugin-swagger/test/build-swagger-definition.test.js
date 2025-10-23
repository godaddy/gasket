import { vi } from 'vitest';
import buildSwaggerDefinition from '../lib/build-swagger-definition.js';
import swaggerJSDoc from 'swagger-jsdoc';
import { writeFile } from 'fs/promises';

vi.mock('fs', () => ({
  constants: {
    F_OK: vi.fn()
  },
  promises: {
    writeFile: vi.fn().mockResolvedValue()
  }
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue()
}));

vi.mock('swagger-jsdoc', () => {
  return { default: vi.fn(() => ({})) };
});

const mockSafeDump = vi.fn();
vi.mock('js-yaml', () => {
  return { default: { safeDump: mockSafeDump } };
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

vi.mock('/path/to/app/package.json', () => ({
  version: '1.0.0'
}), { virtual: true });

vi.mock('path/to/root/from/options/package.json', () => ({
  version: '1.0.0'
}), { virtual: true });

// Mock the createRequire function to handle package.json requires
vi.mock('module', () => ({
  createRequire: vi.fn(() => (path) => {
    if (path.includes('package.json')) {
      return { version: '1.0.0' };
    }
    throw new Error(`Cannot find module '${path}'`);
  })
}));

describe('build-swagger-definition', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      logger: {
        info: vi.fn(),
        warn: vi.fn()
      },
      config: {
        root: '/path/to/app',
        swagger: {
          definitionFile: 'swagger.json',
          jsdoc: {
            definition: {
              openapi: '3.0.0',
              info: {
                version: 'mock'
              }
            },
            apis: ['fake.js']
          }
        }
      }
    };
  });

  afterEach(function () {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('sets up swagger spec', async function () {
    await buildSwaggerDefinition(mockGasket);
    expect(swaggerJSDoc).toHaveBeenCalled();
  });

  it('sets the version to be the package.json version', async function () {
    await buildSwaggerDefinition(mockGasket);
    expect(mockGasket.config.swagger.jsdoc.definition.info.version).toEqual('1.0.0');
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
            openapi: '3.0.0-options',
            info: {
              version: 'mock-options'
            }
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
