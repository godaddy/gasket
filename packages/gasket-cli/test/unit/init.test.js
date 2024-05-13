const mockGetGasketConfigStub = jest.fn();
const mockAssignPresetConfigStub = jest.fn();
const mockConstructorStub = jest.fn();
const mockConfig = { mocked: true };
const mockExecStub = jest.fn();
const mockExecWaterfallStub = jest.fn();

jest.mock('@gasket/engine');
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

  it('does not warn if no gasket.config was found for help command', async () => {
    mockGetGasketConfigStub.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    await initHook({ id: 'help', argv: [], config: mockInitConfig });
    expect(spy).not.toHaveBeenCalledWith('No gasket.config file was found.');
  });
});
