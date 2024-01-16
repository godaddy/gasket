const mockPromptStub = jest.fn();

jest.mock('inquirer', () => ({ prompt: mockPromptStub }));

const globalPrompts = require('../../../../src/scaffold/actions/global-prompts');

describe('globalPrompts', () => {
  let mockContext;
  let chooseAppDescription, choosePackageManager, chooseTestPlugin, allowExtantOverwriting;

  beforeEach(() => {
    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      plugins: [],
      extant: false,
      prompts: true
    };

    mockPromptStub.mockReturnValue({});

    [
      chooseAppDescription,
      choosePackageManager,
      chooseTestPlugin,
      allowExtantOverwriting
    ] = globalPrompts.questions;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(globalPrompts).toHaveProperty('wrapped');
  });

  it('executes question functions with context', async () => {
    mockPromptStub.mockReturnValue({});
    await globalPrompts(mockContext);

    expect(mockPromptStub).toHaveBeenCalledTimes(3);
  });

  describe('packageManager', () => {
    ['npm', 'yarn'].forEach((manager) => {
      it(`[${manager}] does not prompt if packageManager set in context`, async () => {
        mockContext.packageManager = manager;
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockPromptStub).not.toHaveBeenCalled();
      });

      it(`[${manager}] prompts if packageManager not set in context`, async () => {
        mockPromptStub.mockReturnValue({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockPromptStub).toHaveBeenCalled();
        expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'packageManager');
      });

      it(`[${manager}] sets packageManager in context`, async () => {
        mockPromptStub.mockReturnValue({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).toHaveProperty('packageManager', manager);
      });

      it(`[${manager}] sets package manager commands in context`, async () => {
        mockPromptStub.mockReturnValue({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).toHaveProperty('installCmd', `${manager} install`);
      });

      it(`[${manager}] sets package manager commands in context even when packageManager is already set in context`, async () => {
        mockContext.packageManager = manager;
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).toHaveProperty('installCmd', `${manager} install`);
      });
    });
  });

  describe('appDescription', () => {

    it('does not prompt if appDescription set in context', async () => {
      mockContext.appDescription = 'My app description';
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('prompts if appDescription not set in context', async () => {
      mockPromptStub.mockReturnValue({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockPromptStub).toHaveBeenCalled();
      expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'appDescription');
    });

    it('sets appDescription in context', async () => {
      mockPromptStub.mockReturnValue({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockContext).toHaveProperty('appDescription', 'Some description');
    });
  });

  describe('testPlugin', () => {

    it('does not prompt if testPlugin set in context', async () => {
      mockContext.testPlugin = 'bogus';
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('does not prompt if a known test plugin included in context plugins', async () => {
      mockContext.plugins = ['@gasket/mocha'];
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('does not prompt if a known test plugin included by preset', async () => {
      mockContext.presetInfos = [{
        plugins: [
          { name: '@gasket/jest' }
        ]
      }];
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('prompts if testPlugin not set in context', async () => {
      mockPromptStub.mockReturnValue({ testPlugin: 'bogus-plugin' });
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).toHaveBeenCalled();
      expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'testPlugin');
    });

    it('prompts if a known test plugin not included in context plugins', async () => {
      mockContext.plugins = ['gasket-plugin-unknown-test'];
      mockPromptStub.mockReturnValue({ testPlugin: 'bogus' });
      await chooseTestPlugin(mockContext, mockPromptStub);
      expect(mockPromptStub).toHaveBeenCalled();
      expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'testPlugin');
    });

    it('sets testPlugin in context', async () => {
      delete mockContext.testPlugin;
      mockPromptStub.mockReturnValue({ testPlugin: 'bogus' });
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockContext).toHaveProperty('testPlugin', 'bogus');
    });
  });

  describe('allowExtantOverwriting', () => {
    it('does not set confirm if not an extant directory', async () => {
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).not.toContain('destOverride');
    });

    it('sets confirm in context', async () => {
      mockPromptStub.mockReturnValue({ destOverride: 'roger roger' });
      mockContext.extant = true;
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).toHaveProperty('destOverride', 'roger roger');
      expect(mockPromptStub).toHaveBeenCalled();
    });

    it('retains destOverride in context', async () => {
      mockContext.extant = true;
      mockContext.destOverride = true;
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).toHaveProperty('destOverride', true);
      expect(mockPromptStub).not.toHaveBeenCalled();
    });
  });
});
