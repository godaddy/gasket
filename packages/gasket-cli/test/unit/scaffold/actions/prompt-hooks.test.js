const mockEngineStub = jest.fn();
const mockExecWaterfallStub = jest.fn();
const mockInstallStub = jest.fn();
const mockLinkStub = jest.fn();
const mockPromptStub = jest.fn();
const mockCreatePromptModuleStub = jest.fn();

jest.mock('../../../../src/scaffold/create-engine', () => mockEngineStub);
jest.mock('inquirer', () => ({ createPromptModule: mockCreatePromptModuleStub }));

const ConfigBuilder = require('../../../../src/scaffold/config-builder');
const promptHooks = require('../../../../src/scaffold/actions/prompt-hooks');

describe('promptHooks', () => {
  let mockImports, mockContext, pkgAddSpy;

  beforeEach(() => {
    mockExecWaterfallStub.mockResolvedValue();
    mockCreatePromptModuleStub.mockReturnValue(mockPromptStub);
    mockEngineStub.mockReturnValue({ execWaterfall: mockExecWaterfallStub });

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['gasket-preset-bogus'],
      plugins: ['gasket-plugin-bogus-A', 'gasket-plugin-bogus-B'],
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      }),
      pkgManager: {
        install: mockInstallStub,
        link: mockLinkStub,
        info: jest.fn().mockImplementation(() => ({ data: '7.8.9-faked' }))
      },
      prompts: true
    };

    pkgAddSpy = jest.spyOn(mockContext.pkg, 'add');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(promptHooks).toHaveProperty('wrapped');
  });

  it('executes the plugin prompt hook with context', async () => {
    await promptHooks(mockContext);
    expect(mockExecWaterfallStub).toHaveBeenCalledWith('prompt', mockContext, expect.any(Object));
  });

  it('executes the plugin prompt hook with `prompt` util', async () => {
    await promptHooks(mockContext);
    expect(mockExecWaterfallStub.mock.calls[0][2]).toHaveProperty('prompt', mockPromptStub);
  });

  it('executes the plugin prompt hook with `addPlugins` util', async () => {
    await promptHooks(mockContext);
    expect(mockExecWaterfallStub.mock.calls[0][2]).toHaveProperty('addPlugins');
  });

  it('does not execute the plugin prompt hook with --no-prompts', async () => {
    mockContext.prompts = false;
    await promptHooks(mockContext);
    expect(typeof mockExecWaterfallStub.mock.calls[0][2].prompt).toEqual('function');
    expect(mockExecWaterfallStub.mock.calls[0][2].prompt).not.toEqual(mockPromptStub);
  });

  describe('addPlugins', () => {
    async function mockAddPlugins(...pluginsToAdd) {
      await promptHooks(mockContext);
      //
      // access the addPlugins created with context
      //
      const addPlugins = mockExecWaterfallStub.mock.calls[0][2].addPlugins;
      await addPlugins(...pluginsToAdd);
    }

    it('adds new plugins to context', async () => {
      await mockAddPlugins('@gasket/plugin-jest');
      expect(mockContext.plugins).toContain('@gasket/jest');
    });

    it('adds new plugins to pkg', async () => {
      await mockAddPlugins('@gasket/plugin-jest');
      expect(pkgAddSpy).toHaveBeenCalledWith('dependencies', { '@gasket/plugin-jest': '^7.8.9-faked' });
    });

    it('adds new plugins to pkg with version', async () => {
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(pkgAddSpy).toHaveBeenCalledWith('dependencies', { '@gasket/plugin-jest': '^1.2.3' });
    });

    it('installs new packages', async () => {
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockInstallStub).toHaveBeenCalledWith(['@gasket/plugin-jest@^1.2.3']);
    });

    it('re-links packages', async () => {
      mockContext.pkgLinks = ['@gasket/plugin-bogus'];
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockLinkStub).toHaveBeenCalledWith(['@gasket/plugin-bogus']);
    });

    it('does not re-link if no package links', async () => {
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockLinkStub).not.toHaveBeenCalled();
    });

    it('does not install packages if marked as linked', async () => {
      mockContext.pkgLinks = ['@gasket/plugin-jest'];
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockInstallStub).not.toHaveBeenCalled();
    });

    it('re-instantiates PluginEngine with only newly added plugins', async () => {
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockEngineStub).toHaveBeenCalledWith(expect.objectContaining({ plugins: ['@gasket/jest'] }));
    });

    it('re-executes the plugin prompt hook', async () => {
      await mockAddPlugins('@gasket/plugin-jest@^1.2.3');
      expect(mockExecWaterfallStub).toHaveBeenCalledTimes(2);
    });
  });
});
