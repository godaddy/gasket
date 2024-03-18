const mockGetGasketConfigStub = jest.fn();
const mockAssignPresetConfigStub = jest.fn();
const mockConstructorStub = jest.fn();
const mockError = new Error('Bad things man.');
const mockConfig = { mocked: true };
const mockExecStub = jest.fn();
const mockExecWaterfallStub = jest.fn();

jest.mock('@gasket/engine');
jest.mock('@gasket/resolve', () => ({
  loadGasketConfigFile: mockGetGasketConfigStub,
  assignPresetConfig: mockAssignPresetConfigStub
}));
jest.mock('../../lib/config/utils', () => ({
  ...jest.requireActual('../../lib/config/utils'),
  addDefaultPlugins: jest.fn().mockReturnValue(mockConfig)
}));
jest.mock('@gasket/engine', () => {
  return class PluginEngine {
    constructor() {
      mockConstructorStub(...arguments);
      this.config = mockConfig;
    }
    async exec() {
      return mockExecStub(...arguments);
    }

    async execWaterfall() {
      return mockExecWaterfallStub(...arguments);
    }
  };
});

const initHook = require('../../lib/init');

describe('init hook', () => {
  let mockInitConfig;

  beforeEach(() => {
    mockInitConfig = {
      bin: {
        parseAsync: jest.fn(),
        opts: jest.fn().mockReturnValue({})
      },
      root: '/path/to/app',
      options: { gasketConfig: 'gasket.config' }
    };
    mockGetGasketConfigStub.mockResolvedValue(mockConfig);
    mockAssignPresetConfigStub.mockReturnValue(mockConfig);
    mockExecStub.mockResolvedValue([]);
    mockExecWaterfallStub.mockResolvedValue([]);
  });

  afterEach(function () {
    jest.clearAllMocks();
    delete process.env.GASKET_ENV;
    delete process.env.GASKET_CONFIG;
    delete process.env.GASKET_ROOT;
    delete process.env.GASKET_COMMAND;
  });

  it('set env vars from flags', async () => {
    process.env.NODE_ENV = '';
    expect(process.env).not.toHaveProperty('GASKET_ENV');
    expect(process.env).not.toHaveProperty('GASKET_ROOT');
    expect(process.env).not.toHaveProperty('GASKET_CONFIG');
    expect(process.env).not.toHaveProperty('GASKET_COMMAND');

    await initHook({ id: 'build', argv: [], config: mockInitConfig });

    expect(process.env.GASKET_ENV).toEqual('development');
    expect(process.env.GASKET_ROOT).toEqual('/path/to/app');
    expect(process.env.GASKET_CONFIG).toEqual('gasket.config');
    expect(process.env.GASKET_COMMAND).toEqual('build');
  });

  it('gets the gasket.config', async () => {
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(mockGetGasketConfigStub).toHaveBeenCalled();
  });

  it('instantiates plugin engine with config', async () => {
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(mockConstructorStub).toHaveBeenCalledWith(mockConfig, { resolveFrom: '/path/to/app' });
  });

  it('instantiates plugin engine resolveFrom root', async () => {
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(mockConstructorStub).toHaveBeenCalledWith(mockConfig, { resolveFrom: '/path/to/app' });
  });

  it('assigns config from presets', async () => {
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(mockAssignPresetConfigStub).toHaveBeenCalled();
  });

  it('warns if no env specified', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(spy).toHaveBeenCalledWith('No env specified, falling back to "development".');
  });

  it('does not warn if no env specified for help command', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    await initHook({ id: 'help', argv: [], config: mockInitConfig });
    expect(spy).not.toHaveBeenCalledWith('No env specified, falling back to "development".');
  });

  it('warns if no gasket.config was found', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(spy).toHaveBeenCalledWith('No gasket.config file was found.');
  });

  it('does not warn if no gasket.config was found for help command', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    await initHook({ id: 'help', argv: [], config: mockInitConfig });
    expect(spy).not.toHaveBeenCalledWith('No gasket.config file was found.');
  });

  it('errors and exits if problem getting gasket.config', async () => {
    mockGetGasketConfigStub.mockRejectedValueOnce(mockError);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    await initHook({ id: 'build', argv: [], config: mockInitConfig });
    expect(spy).toHaveBeenCalledWith(mockError, { exit: 1 });
  });

  describe('execute lifecycle hooks', () => {

    it('getCommandOptions', async () => {
      await initHook({ id: 'build', argv: [], config: mockInitConfig });
      expect(mockExecStub).toHaveBeenCalled();
      expect(mockExecStub.mock.calls[0][0]).toEqual('getCommandOptions');
      expect(mockExecStub.mock.calls[0][1]).toEqual(mockInitConfig);
    });

    it('getCommands', async () => {
      await initHook({ id: 'build', argv: [], config: mockInitConfig });
      expect(mockExecStub.mock.calls[1][0]).toEqual('getCommands');
      expect(mockExecStub.mock.calls[1][1]).toEqual(mockInitConfig);
    });

    it('init', async () => {
      await initHook({ id: 'build', argv: [], config: mockInitConfig });
      expect(mockExecStub.mock.calls[2][0]).toEqual('init');
    });

    it('configure', async () => {
      await initHook({ id: 'build', argv: [], config: mockInitConfig });
      expect(mockExecWaterfallStub.mock.calls[0][0]).toEqual('configure');
      expect(mockExecWaterfallStub.mock.calls[0][1]).toEqual(mockConfig);
    });
  });
});
