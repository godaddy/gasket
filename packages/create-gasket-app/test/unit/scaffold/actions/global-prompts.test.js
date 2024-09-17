import { jest } from '@jest/globals';
const mockPromptStub = jest.fn();

jest.unstable_mockModule('inquirer', () => ({
  default: {
    createPromptModule() { return mockPromptStub; }
  }
}));

const globalPromptsImport = await import('../../../../lib/scaffold/actions/global-prompts.js');
const globalPrompts = globalPromptsImport.default;
const { questions } = globalPromptsImport;

describe('globalPrompts', () => {
  let mockContext;
  let chooseAppDescription, choosePackageManager, chooseTestPlugins, allowExtantOverwriting;

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
      chooseTestPlugins,
      allowExtantOverwriting
    ] = questions;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated action', async () => {
    expect(globalPrompts).toHaveProperty('wrapped');
  });

  it('executes question functions with context', async () => {
    mockPromptStub.mockReturnValue({});
    await globalPrompts({ context: mockContext });

    expect(mockPromptStub).toHaveBeenCalledTimes(4);
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
      mockContext.testPlugins = ['bogus'];
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('prompts if testPlugins not set in context', async () => {
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockPromptStub).toHaveBeenCalled();
      expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'testPlugin');
      expect(mockPromptStub.mock.calls[1][0][0]).toHaveProperty('name', 'testPlugin');
    });

    it('prompts if a known test plugin not included in context plugins', async () => {
      await chooseTestPlugins(mockContext, mockPromptStub);
      expect(mockPromptStub).toHaveBeenCalled();

      expect(mockPromptStub.mock.calls[0][0][0]).toHaveProperty('name', 'testPlugin');
      expect(mockPromptStub.mock.calls[1][0][0]).toHaveProperty('name', 'testPlugin');
    });

    it('sets testPlugin in context', async () => {
      delete mockContext.testPlugin;
      mockPromptStub
        .mockReturnValueOnce({ testPlugin: 'firstValue' })
        .mockReturnValueOnce({ testPlugin: 'secondValue' });
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockContext).toHaveProperty('testPlugins', ['firstValue', 'secondValue']);
    });

    it('does not prompt if unitTestSuite and integrationTestSuite is defined in context', async () => {
      mockContext.unitTestSuite = 'jest';
      mockContext.integrationTestSuite = 'cypress';
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockPromptStub).not.toHaveBeenCalled();
    });

    it('prompts once if unitTestSuite is defined in context', async () => {
      mockContext.unitTestSuite = 'jest';
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockPromptStub).toHaveBeenCalledTimes(1);
    });

    it('prompts once if integrationTestSuite is defined in context', async () => {
      mockContext.integrationTestSuite = 'cypress';
      await chooseTestPlugins(mockContext, mockPromptStub);

      expect(mockPromptStub).toHaveBeenCalledTimes(1);
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
