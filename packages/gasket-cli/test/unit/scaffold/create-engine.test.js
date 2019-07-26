const sinon = require('sinon');
const assume = require('assume');
const proxyquire = require('proxyquire');
const path = require('path');
const gitPlugin = require('@gasket/git-plugin');

describe('createEngine', () => {
  let sandbox, mockImports, mockOpts, createHooks;
  let pluginEngineSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockOpts = {
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin']
    };

    mockImports = {
      '@gasket/plugin-engine': class PluginEngine {}
    };

    pluginEngineSpy = sandbox.spy(mockImports, '@gasket/plugin-engine');


    createHooks = proxyquire('../../../src/scaffold/create-engine', mockImports);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('instantiates PluginEngine with preset from context in array', async () => {
    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch({ plugins: { presets: ['bogus-preset'] } });
  });

  it('instantiates PluginEngine if no preset in context', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch({ plugins: { presets: [] } });
  });

  it('instantiates PluginEngine with built-in git-plugin', async () => {
    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch({ plugins: { add: [gitPlugin, 'bogus-A-plugin', 'bogus-B-plugin'] } });
  });

  it('instantiates PluginEngine with plugins from context', async () => {
    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch({ plugins: { add: [sinon.match.any, 'bogus-A-plugin', 'bogus-B-plugin'] } });
  });

  it('instantiates PluginEngine if no plugins in context', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch({ plugins: { add: [sinon.match.any] } });
  });

  it('instantiates PluginEngine with resolveFrom options', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createHooks(mockOpts);
    assume(pluginEngineSpy).calledWithMatch(sinon.match.any, { resolveFrom: path.join(mockOpts.dest, 'node_modules') });
  });
});
