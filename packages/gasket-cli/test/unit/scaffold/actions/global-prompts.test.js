const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');

describe('globalPrompts', () => {
  let sandbox, mockContext, mockImports, globalPrompts;
  let promptStub;
  let chooseAppDescription, choosePackageManager, chooseTestPlugin, allowExtantOverwriting;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      plugins: [],
      extant: false
    };

    promptStub = sandbox.stub().returns({});

    mockImports = {
      'inquirer': {
        prompt: promptStub
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    globalPrompts = proxyquire('../../../../src/scaffold/actions/global-prompts', mockImports);

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
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(globalPrompts).property('wrapped');
  });

  it('executes question functions with context', async () => {
    promptStub.returns({});
    await globalPrompts(mockContext);

    assume(promptStub).is.called(3);
  });

  describe('packageManager', () => {
    ['npm', 'yarn'].forEach((manager) => {
      it(`[${manager}] does not prompt if packageManager set in context`, async () => {
        mockContext.packageManager = manager;
        await choosePackageManager(mockContext);

        assume(promptStub).not.called();
      });

      it(`[${manager}] prompts if packageManager not set in context`, async () => {
        promptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext);

        assume(promptStub).is.called();
        assume(promptStub.args[0][0][0]).property('name', 'packageManager');
      });

      it(`[${manager}] sets packageManager in context`, async () => {
        promptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext);

        assume(mockContext).property('packageManager', manager);
      });

      it(`[${manager}] sets package manager commands in context`, async () => {
        promptStub.returns({ packageManager: manager });
        await choosePackageManager(mockContext);

        assume(mockContext).property('installCmd', `${manager} install`);
      });
    });
  });

  describe('appDescription', () => {

    it('does not prompt if appDescription set in context', async () => {
      mockContext.appDescription = 'My app description';
      await chooseAppDescription(mockContext);

      assume(promptStub).not.called();
    });

    it('prompts if appDescription not set in context', async () => {
      promptStub.returns({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext);

      assume(promptStub).is.called();
      assume(promptStub.args[0][0][0]).property('name', 'appDescription');
    });

    it('sets appDescription in context', async () => {
      promptStub.returns({ appDescription: 'Some description' });
      await chooseAppDescription(mockContext);

      assume(mockContext).property('appDescription', 'Some description');
    });
  });

  describe('testPlugin', () => {

    it('does not prompt if testPlugin set in context', async () => {
      mockContext.testPlugin = 'bogus-plugin';
      await chooseTestPlugin(mockContext);

      assume(promptStub).not.called();
    });

    it('does not prompt if a known test plugin included in context plugins', async () => {
      mockContext.plugins = ['mocha'];
      await chooseTestPlugin(mockContext);

      assume(promptStub).not.called();
    });

    it('does not prompt if a known test plugin included by preset', async () => {
      mockContext.presetInfos = [{
        plugins: [
          { name: '@gasket/jest-plugin' }
        ]
      }];
      await chooseTestPlugin(mockContext);

      assume(promptStub).not.called();
    });

    it('prompts if testPlugin not set in context', async () => {
      promptStub.returns({ testPlugin: 'bogus-plugin' });
      await chooseTestPlugin(mockContext);

      assume(promptStub).is.called();
      assume(promptStub.args[0][0][0]).property('name', 'testPlugin');
    });

    it('prompts if a known test plugin not included in context plugins', async () => {
      mockContext.plugins = ['unknown-test-plugin'];
      promptStub.returns({ testPlugin: 'bogus-plugin' });
      await chooseTestPlugin(mockContext);

      assume(promptStub).is.called();
      assume(promptStub.args[0][0][0]).property('name', 'testPlugin');
    });

    it('sets testPlugin in context', async () => {
      delete mockContext.testPlugin;
      promptStub.returns({ testPlugin: 'bogus-plugin' });
      await chooseTestPlugin(mockContext);

      assume(mockContext).property('testPlugin', 'bogus-plugin');
    });
  });

  describe('allowExtantOverwriting', () => {
    it('does not set confirm if not an extant directory', async () => {
      await allowExtantOverwriting(mockContext);
      assume(mockContext).does.not.own('destOverride');
    });

    it('sets confirm in context', async () => {
      promptStub.returns({ destOverride: 'roger roger' });
      mockContext.extant = true;
      await allowExtantOverwriting(mockContext);
      assume(mockContext).property('destOverride', 'roger roger');
    });
  });
});
