const mockPromptStub = jest.fn();

jest.mock('inquirer', () => ({ prompt: mockPromptStub }));

const globalPrompts = require('../../../../src/scaffold/actions/global-prompts');

describe('globalPrompts', () => {
  let sandbox, mockContext;
  let mockPromptStub;
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

    // mockImports = {
    //   'inquirer': {
    //     prompt: mockPromptStub
    //   },
    //   '../action-wrapper': require('../../../helpers').mockActionWrapper
    // };

    // globalPrompts = proxyquire('../../../../src/scaffold/actions/global-prompts', mockImports);

    //
    // Get the individual prompts. These are ordered in the action.
    //
    [
      chooseAppDescription,
      choosePackageManager,
      chooseTestPlugin,
      allowExtantOverwriting
    ] = globalPrompts.questions;
  });

  afterEach(() => {
    // sandbox.restore();
  });

  it('is decorated action', async () => {
    expect(globalPrompts).property('wrapped');
  });

  it('executes question functions with context', async () => {
    mockPromptStub.returns({});
    await globalPrompts(mockContext);

    expect(mockPromptStub).is.called(3);
  });

  describe('packageManager', () => {
    ['npm', 'yarn'].forEach((manager) => {
      it(`[${manager}] does not prompt if packageManager set in context`, async () => {
        mockContext.packageManager = manager;
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockPromptStub).not.called();
      });

      it(`[${manager}] prompts if packageManager not set in context`, async () => {
        mockPromptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockPromptStub).is.called();
        expect(mockPromptStub.args[0][0][0]).property('name', 'packageManager');
      });

      it(`[${manager}] sets packageManager in context`, async () => {
        mockPromptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).property('packageManager', manager);
      });

      it(`[${manager}] sets package manager commands in context`, async () => {
        mockPromptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).property('installCmd', `${manager} install`);
      });

      it(`[${manager}] sets package manager commands in context even when packageManager is already set in context`, async () => {
        mockContext.packageManager = manager;
        await choosePackageManager(mockContext, mockPromptStub);

        expect(mockContext).property('installCmd', `${manager} install`);
      });
    });
  });

  describe('appDescription', () => {

    it('does not prompt if appDescription set in context', async () => {
      mockContext.appDescription = 'My app description';
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockPromptStub).not.called();
    });

    it('prompts if appDescription not set in context', async () => {
      mockPromptStub.returns({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockPromptStub).is.called();
      expect(mockPromptStub.args[0][0][0]).property('name', 'appDescription');
    });

    it('sets appDescription in context', async () => {
      mockPromptStub.returns({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext, mockPromptStub);

      expect(mockContext).property('appDescription', 'Some description');
    });
  });

  describe('testPlugin', () => {

    it('does not prompt if testPlugin set in context', async () => {
      mockContext.testPlugin = 'bogus';
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.called();
    });

    it('does not prompt if a known test plugin included in context plugins', async () => {
      mockContext.plugins = ['@gasket/mocha'];
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.called();
    });

    it('does not prompt if a known test plugin included by preset', async () => {
      mockContext.presetInfos = [{
        plugins: [
          { name: '@gasket/jest' }
        ]
      }];
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).not.called();
    });

    it('prompts if testPlugin not set in context', async () => {
      mockPromptStub.returns({ testPlugin: 'bogus-plugin' });
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).is.called();
      expect(mockPromptStub.args[0][0][0]).property('name', 'testPlugin');
    });

    it('prompts if a known test plugin not included in context plugins', async () => {
      mockContext.plugins = ['gasket-plugin-unknown-test'];
      mockPromptStub.returns({ testPlugin: 'bogus' });
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockPromptStub).is.called();
      expect(mockPromptStub.args[0][0][0]).property('name', 'testPlugin');
    });

    it('sets testPlugin in context', async () => {
      delete mockContext.testPlugin;
      mockPromptStub.returns({ testPlugin: 'bogus' });
      await chooseTestPlugin(mockContext, mockPromptStub);

      expect(mockContext).property('testPlugin', 'bogus');
    });
  });

  describe('allowExtantOverwriting', () => {
    it('does not set confirm if not an extant directory', async () => {
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).does.not.own('destOverride');
    });

    it('sets confirm in context', async () => {
      mockPromptStub.returns({ destOverride: 'roger roger' });
      mockContext.extant = true;
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).property('destOverride', 'roger roger');
      expect(mockPromptStub).is.called();
    });

    it('retains destOverride in context', async () => {
      mockContext.extant = true;
      mockContext.destOverride = true;
      await allowExtantOverwriting(mockContext, mockPromptStub);
      expect(mockContext).property('destOverride', true);
      expect(mockPromptStub).is.not.called();
    });
  });
});
