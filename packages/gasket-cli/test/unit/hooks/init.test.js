const mockGetGasketConfigStub = jest.fn();
const mockAssignPresetConfigStub = jest.fn();
const mockWarnStub = jest.fn();
const mockErrorStub = jest.fn();
const mockParseStub = jest.fn();
const mockError = new Error('Bad things man.');
const mockConfig = { mocked: true };
const PluginEngine = require('@gasket/engine');

class MockCommand {}
MockCommand.flags = {};

jest.mock('@gasket/engine');
jest.mock('@gasket/plugin-command', () => ({ GasketCommand: MockCommand }));
jest.mock('@gasket/resolve', () => ({
  loadGasketConfigFile: mockGetGasketConfigStub,
  assignPresetConfig: mockAssignPresetConfigStub
}));
jest.mock('@oclif/parser', () => ({ parse: mockParseStub }));
jest.mock('../../../src/config/utils', () => ({
  ...jest.requireActual('../../../src/config/utils'),
  addDefaultPlugins: jest.fn().mockReturnValue(mockConfig)
}));

const _initHook = require('../../../src/hooks/init');

const initHook = function mockInitHook() {
  return _initHook.apply(
    { warn: mockWarnStub, error: mockErrorStub },
    arguments
  );
};

describe('init hook', () => {
  beforeEach(() => {
    mockGetGasketConfigStub.mockResolvedValue(mockConfig);
    mockAssignPresetConfigStub.mockReturnValue(mockConfig);
    mockParseStub.mockReturnValue({
      flags: { root: '/path/to/app', config: 'gasket.config' }
    });
  });

  afterEach(function () {
    jest.clearAllMocks();
    delete process.env.GASKET_ENV;
    delete process.env.GASKET_CONFIG;
    delete process.env.GASKET_ROOT;
    delete process.env.GASKET_COMMAND;
  });

  it('ends early for create command', async () => {
    await initHook({ id: 'create' });
    expect(mockGetGasketConfigStub).not.toHaveBeenCalled();
  });

  it('parses flags', async () => {
    await initHook({ id: 'build', argv: [] });
    expect(mockParseStub).toHaveBeenCalled();
  });

  it('set env vars from flags', async () => {
    process.env.NODE_ENV = '';
    expect(process.env).not.toHaveProperty('GASKET_ENV');
    expect(process.env).not.toHaveProperty('GASKET_ROOT');
    expect(process.env).not.toHaveProperty('GASKET_CONFIG');
    expect(process.env).not.toHaveProperty('GASKET_COMMAND');

    await initHook({ id: 'build', argv: [] });

    expect(process.env.GASKET_ENV).toEqual('development');
    expect(process.env.GASKET_ROOT).toEqual('/path/to/app');
    expect(process.env.GASKET_CONFIG).toEqual('gasket.config');
    expect(process.env.GASKET_COMMAND).toEqual('build');
  });

  it('gets the gasket.config', async () => {
    await initHook({ id: 'build', argv: [] });
    expect(mockGetGasketConfigStub).toHaveBeenCalled();
  });

  it('instantiates plugin engine with config', async () => {
    await initHook({ id: 'build', argv: [], config: {} });
    expect(PluginEngine).toHaveBeenCalledWith(mockConfig, {
      resolveFrom: '/path/to/app'
    });
  });

  it('instantiates plugin engine resolveFrom root', async () => {
    await initHook({ id: 'build', argv: [], config: {} });
    expect(PluginEngine).toHaveBeenCalledWith(mockConfig, {
      resolveFrom: '/path/to/app'
    });
  });

  it('assigns config from presets', async () => {
    await initHook({ id: 'build', argv: [] });
    expect(mockAssignPresetConfigStub).toHaveBeenCalled();
  });

  it('executes initOclif gasket lifecycle', async () => {
    const spy = jest.spyOn(PluginEngine.prototype, 'exec');
    await initHook({ id: 'build', argv: [], config: {} });
    expect(spy).toHaveBeenCalledWith('initOclif', expect.any(Object));
  });

  it('warns if no env specified', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    await initHook({ id: 'build', argv: [], config: {} });
    expect(mockWarnStub).toHaveBeenCalledWith(
      'No env specified, falling back to "development".'
    );
  });

  it('does not warn if no env specified for help command', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    await initHook({ id: 'help', argv: [], config: {} });
    expect(mockWarnStub).not.toHaveBeenCalledWith(
      'No env specified, falling back to "development".'
    );
  });

  it('warns if no gasket.config was found', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    await initHook({ id: 'build', argv: [], config: {} });
    expect(mockWarnStub).toHaveBeenCalledWith(
      'No gasket.config file was found.'
    );
  });

  it('does not warn if no gasket.config was found for help command', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    await initHook({ id: 'help', argv: [], config: {} });
    expect(mockWarnStub).not.toHaveBeenCalledWith(
      'No gasket.config file was found.'
    );
  });

  it('errors and exits if problem getting gasket.config', async () => {
    mockGetGasketConfigStub.mockRejectedValueOnce(mockError);
    await initHook({ id: 'build', argv: [], config: {} });
    expect(mockErrorStub).toHaveBeenCalledWith(mockError, { exit: 1 });
  });
});
