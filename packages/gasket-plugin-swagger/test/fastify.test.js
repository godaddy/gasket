const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockAccessStub = jest.fn().mockResolvedValue();
const mockYamlSafeLoadStub = jest.fn().mockResolvedValue({ data: true });
const mockYamlSafeDumpStub = jest.fn();
const mockOKStub = jest.fn();

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

jest.mock('js-yaml', () => ({
  safeDump: mockYamlSafeDumpStub,
  safeLoad: mockYamlSafeLoadStub
}));

jest.mock('/path/to/app/swagger.json', () => ({ data: true }), { virtual: true });

describe('fastify hook', function () {
  let plugin, gasket, mockApp;

  beforeEach(async () => {
    plugin = require('../lib/index');
    mockApp = {
      register: jest.fn(),
      ready: jest.fn(),
      get: jest.fn()
    };

    const GasketEngine = require('@gasket/engine');
    gasket = new GasketEngine({
      plugins: {
        add: ['log', plugin]
      },
      root: '/path/to/app',
      swagger: {
        definitionFile: 'swagger.json',
        apiDocsRoute: '/api-docs'
      }
    });
    gasket.command = { id: 'start' };
    await gasket.exec('init');
  });

  afterEach(function () {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('swagger file is missing, gasket.logger logs error', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';
    mockAccessStub.mockRejectedValueOnce();
    jest.spyOn(gasket.logger, 'error');

    await gasket.exec('fastify', mockApp);

    expect(gasket.logger.error).toHaveBeenCalledWith(`Missing ${gasket.config.swagger.definitionFile} file...`);
  });

  it('loads the swagger spec yaml file', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';

    await gasket.exec('fastify', mockApp);

    expect(mockYamlSafeLoadStub).toHaveBeenCalled();
  });

  it('only loads the swagger spec file once', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';
    expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();

    await gasket.exec('fastify', mockApp);
    expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);

    await gasket.exec('fastify', mockApp);
    expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
  });

  it('loads the swagger spec json file', async function () {
    await gasket.exec('fastify', mockApp);
    expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
  });

  it('sets the api docs route', async function () {
    await gasket.exec('fastify', mockApp);
    expect(mockApp.register).toHaveBeenCalledWith(
      expect.any(Function),
      {
        prefix: '/api-docs',
        swagger: { data: true },
        uiConfig: {},
        preHandler: []
      }
    );
  });

  it('adds new routes to swagger paths', async function () {
    const fastify = require('fastify')({ logger: true });

    await gasket.exec('fastify', fastify);
    fastify.get('/hello-world', () => {});
    await fastify.ready();
    expect(fastify.swagger().paths).toHaveProperty('/hello-world');
  });

  it('supports a pre handler', async function () {
    const mockPreHandler = jest.fn();
    gasket.hook({
      event: 'swaggerFastifyPreHandler',
      handler: () => mockPreHandler
    });

    await gasket.exec('fastify', mockApp);

    expect(mockApp.register).toHaveBeenCalledWith(
      expect.any(Function),
      {
        prefix: '/api-docs',
        swagger: { data: true },
        uiConfig: {},
        preHandler: [mockPreHandler]
      }
    );
  });
});
