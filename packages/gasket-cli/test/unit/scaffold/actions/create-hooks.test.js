const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const ConfigBuilder = require('../../../../src/scaffold/config-builder');


describe('createHooks', () => {
  let sandbox, mockImports, mockContext, mockPlugin, createHooks;
  let pluginEngineSpy, execApplyStub, handlerStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockPlugin = { name: 'mockPlugin' };
    handlerStub = sandbox.stub().resolves();
    execApplyStub = sandbox.stub().callsArgWithAsync(1, mockPlugin, handlerStub);

    mockContext = {
      appName: 'my-app',
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin'],
      pkg: {},
      runWith(source) {
        this.source = source;
        return this;
      }
    };

    mockImports = {
      '@gasket/plugin-engine': class PluginEngine {
        execApply(hook, applyFn) {
          execApplyStub(hook, applyFn);
        }
      },
      '../files': class Files {
      },
      '../action-wrapper': require('../../../helpers').mockActionWrapper
    };

    pluginEngineSpy = sandbox.spy(mockImports, '@gasket/plugin-engine');

    createHooks = proxyquire('../../../../src/scaffold/actions/create-hooks', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is decorated action', async () => {
    assume(createHooks).property('wrapped');
  });

  it('adds files to context', async () => {
    await createHooks(mockContext);
    assume(mockContext.files).to.be.instanceOf(mockImports['../files']);
  });

  it('adds gasketConfig to context', async () => {
    await createHooks(mockContext);
    assume(mockContext.gasketConfig).is.instanceOf(ConfigBuilder);
  });

  it('instantiates PluginEngine with preset from context in array', async () => {
    await createHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls(['bogus-preset']);
  });

  it('instantiates PluginEngine if no preset in context', async () => {
    mockContext = {
      dest: '/some/path/my-app',
      runWith(source) {
        this.source = source;
        return this;
      }
    };

    await createHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.presets).eqls([]);
  });

  it('instantiates PluginEngine with plugins from context', async () => {
    await createHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls(['bogus-A-plugin', 'bogus-B-plugin']);
  });

  it('instantiates PluginEngine if no plugins in context', async () => {
    mockContext = {
      dest: '/some/path/my-app',
      runWith(source) {
        this.source = source;
        return this;
      }
    };

    await createHooks(mockContext);
    assume(pluginEngineSpy.args[0][0].plugins.add).eqls([]);
  });

  it('executes the create hook for plugins with context', async () => {
    await createHooks(mockContext);
    assume(execApplyStub).is.calledWithMatch('create', handlerStub);
    assume(handlerStub).is.calledWithMatch(mockContext);
  });

  it('sets plugin as `context.source`', async () => {
    await createHooks(mockContext);
    assume(mockContext.source).eqls(mockPlugin);
  });
});
