const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');

describe('createHooks', () => {
  let sandbox, mockImports, mockContext, promptHooks;
  let pluginEngineSpy, pkgAddSpy, execWaterfallStub, installStub, linkStub, promptStub, createPromptModuleStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    execWaterfallStub = sandbox.stub().resolves();
    installStub = sandbox.stub();
    linkStub = sandbox.stub();
    promptStub = sandbox.stub();
    createPromptModuleStub = sandbox.stub().returns(promptStub);

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: ConfigBuilder.createPackageJson({
        name: 'my-app',
        version: '0.0.0'
      })
    };

    mockImports = {
      '@gasket/plugin-engine': class PluginEngine {
        execWaterfall() {
          return execWaterfallStub(...arguments);
        }
      },
      '../package-manager': class PackageManager {
        constructor() {
          this.install = installStub;
          this.link = linkStub;
        }
      },
      'inquirer': {
        createPromptModule: createPromptModuleStub
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    pluginEngineSpy = sandbox.spy(mockImports, '@gasket/plugin-engine');
    pkgAddSpy = sandbox.spy(mockContext.pkg, 'add');

    promptHooks = proxyquire('../../../../src/scaffold/actions/prompt-hooks', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(promptHooks).property('wrapped');
  });

  it('instantiates PluginEngine with preset from context in array', async () => {
    await promptHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls(['bogus-preset']);
  });

  it('instantiates PluginEngine if no preset in context', async () => {
    mockContext = {
      dest: '/some/path/my-app'
    };
    await promptHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls([]);
  });

  it('instantiates PluginEngine with plugins from context', async () => {
    await promptHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls(['bogus-A-plugin', 'bogus-B-plugin']);
  });

  it('instantiates PluginEngine if no plugins in context', async () => {
    mockContext = {
      dest: '/some/path/my-app'
    };
    await promptHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls([]);
  });

  it('executes the plugin prompt hook with context', async () => {
    await promptHooks(mockContext);
    assume(execWaterfallStub).is.calledWithMatch('prompt', mockContext);
  });

  it('executes the plugin prompt hook with `prompt` util', async () => {
    await promptHooks(mockContext);
    assume(execWaterfallStub.args[0][2]).property('prompt', promptStub);
  });

  it('executes the plugin prompt hook with `addPlugins` util', async () => {
    await promptHooks(mockContext);
    assume(execWaterfallStub.args[0][2]).property('addPlugins');
  });

  describe('addPlugins', () => {
    async function mockAddPlugins(...pluginsToAdd) {
      await promptHooks(mockContext);
      //
      // access the addPlugins created with context
      //
      const addPlugins = execWaterfallStub.args[0][2].addPlugins;
      await addPlugins(...pluginsToAdd);
    }

    it('adds new plugins to context', async () => {
      await mockAddPlugins('@gasket/jest-plugin');
      assume(mockContext.plugins).contains('jest');
    });

    it('adds new plugins to pkg', async () => {
      await mockAddPlugins('@gasket/jest-plugin');
      assume(pkgAddSpy).is.calledWith('dependencies', { '@gasket/jest-plugin': 'latest' });
    });

    it('adds new plugins to pkg with version', async () => {
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(pkgAddSpy).is.calledWith('dependencies', { '@gasket/jest-plugin': '^1.2.3' });
    });

    it('installs new packages', async () => {
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(installStub).is.calledWith(['@gasket/jest-plugin@^1.2.3']);
    });

    it('re-links packages', async () => {
      mockContext.pkgLinks = ['@gasket/bogus-plugin'];
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(linkStub).is.calledWith(['@gasket/bogus-plugin']);
    });

    it('does not re-link if no package links', async () => {
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(linkStub).not.called();
    });

    it('does not install packages if marked as linked', async () => {
      mockContext.pkgLinks = ['@gasket/jest-plugin'];
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(installStub).not.called();
    });

    it('re-instantiates PluginEngine with only newly added plugins', async () => {
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(pluginEngineSpy.args[1][0].plugins.add).eqls(['jest']);
    });

    it('re-executes the plugin prompt hook', async () => {
      await mockAddPlugins('@gasket/jest-plugin@^1.2.3');
      assume(execWaterfallStub).is.called(2);
    });
  });
});
