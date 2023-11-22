const mockOKStub = jest.fn();
const mockReadFileStub = jest.fn();
const mockWriteFileStub = jest.fn();
const mockAccessStub = jest.fn().mockResolvedValue();
const mockYamlSafeLoadStub = jest.fn().mockResolvedValue({ data: true });
const mockYamlSafeDumpStub = jest.fn();

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

jest.mock(
  '/path/to/app/swagger.json',
  () => ({ data: true }), { virtual: true }
);

describe('The express hook', function () {
  let swaggerPlugin, gasket, mockApp;

  beforeEach(async () => {
    swaggerPlugin = require('../lib/index');

    const GasketEngine = require('@gasket/engine');
    gasket = new GasketEngine({
      plugins: {
        add: ['log', swaggerPlugin]
      },
      root: '/path/to/app',
      swagger: {
        definitionFile: 'swagger.json',
        apiDocsRoute: '/api-docs'
      }
    });

    gasket.command = { id: 'start' };
    await gasket.exec('init');

    mockApp = {
      use: jest.fn()
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('swagger file is missing, gasket.logger logs error', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';
    mockAccessStub.mockRejectedValueOnce();
    jest.spyOn(gasket.logger, 'error');

    await gasket.exec('express', mockApp);

    expect(gasket.logger.error).toHaveBeenCalledWith(`Missing ${gasket.config.swagger.definitionFile} file...`);
  });

  it('loads the swagger spec yaml file', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';

    await gasket.exec('express', mockApp);

    expect(mockYamlSafeLoadStub).toHaveBeenCalled();
  });

  it('only loads the swagger spec file once', async function () {
    gasket.config.swagger.definitionFile = 'swagger.yaml';
    expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();

    await gasket.exec('express', mockApp);
    expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);

    await gasket.exec('express', mockApp);
    expect(mockYamlSafeLoadStub).toHaveBeenCalledTimes(1);
  });

  it('loads the swagger spec json file', async function () {
    await gasket.exec('express', mockApp);
    expect(mockYamlSafeLoadStub).not.toHaveBeenCalled();
  });

  it('sets the api docs route', async function () {
    await gasket.exec('express', mockApp);
    expect(mockApp.use).toHaveBeenCalledWith(
      '/api-docs',
      expect.any(Array));
  });

  it('allows custom middleware to be injected', async () => {
    const mockMiddleware = jest.fn();
    gasket.hook({
      event: 'swaggerExpressMiddleware',
      handler: () => mockMiddleware
    });

    await gasket.exec('express', mockApp);

    expect(mockApp.use).toHaveBeenCalledWith(
      '/api-docs',
      expect.arrayContaining([mockMiddleware]));
  });
});
