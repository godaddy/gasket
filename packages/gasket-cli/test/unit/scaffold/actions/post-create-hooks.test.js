const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('postCreateHooks', () => {
  let sandbox, mockImports, mockContext, postCreateHooks;
  let pluginEngineSpy, execStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    execStub = sandbox.stub().resolves();
    mockContext = {
      dest: '/some/path/my-app',
      presets: ['charcuterie-preset'],
      plugins: ['the-wurst-plugin', 'loaf-me-alone']
    };
    mockImports = {
      '@gasket/plugin-engine': class PluginEngine {
        exec() {
          return execStub(...arguments);
        }
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    pluginEngineSpy = sandbox.spy(mockImports, '@gasket/plugin-engine');
    postCreateHooks = proxyquire('../../../../src/scaffold/actions/post-create-hooks', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(postCreateHooks).property('wrapped');
  });

  it('instantiates PluginEngine with preset from context in array', async () => {
    await postCreateHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls(['charcuterie-preset']);
  });

  it('instantiates PluginEngine if no preset in context', async () => {
    mockContext = {
      dest: '/some/path/my-app'
    };
    await postCreateHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls([]);
  });

  it('instantiates PluginEngine with plugins from context', async () => {
    await postCreateHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls(['the-wurst-plugin', 'loaf-me-alone']);
  });

  it('instantiates PluginEngine if no plugins in context', async () => {
    mockContext = {
      dest: '/some/path/my-app'
    };
    await postCreateHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls([]);
  });

  it('executes the postCreate hook for plugins with context', async () => {
    await postCreateHooks(mockContext);
    assume(execStub).is.calledWithMatch('postCreate', mockContext);
    assume(execStub.lastCall.lastArg).contains('runScript');
  });
});
