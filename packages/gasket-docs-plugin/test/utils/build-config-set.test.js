/* eslint-disable max-nested-callbacks, max-len */
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');


const builderConstructorStub = sinon.stub();
const addAppStub = sinon.stub();
const addPluginStub = sinon.stub();
const addPluginsStub = sinon.stub();
const addPresetStub = sinon.stub();
const addPresetsStub = sinon.stub();
const addModuleStub = sinon.stub();
const addModulesStub = sinon.stub();
const getConfigSetStub = sinon.stub();

class MockBuilder {
  constructor() {
    builderConstructorStub(...arguments);
  }

  addApp() {
    addAppStub(...arguments);
  }
  addPlugin() {
    addPluginStub(...arguments);
  }
  addPlugins() {
    addPluginsStub(...arguments);
  }
  addPreset() {
    addPresetStub(...arguments);
  }
  addPresets() {
    addPresetsStub(...arguments);
  }
  addModule() {
    addModuleStub(...arguments);
  }
  addModules() {
    addModulesStub(...arguments);
  }
  getConfigSet() {
    getConfigSetStub(...arguments);
  }
}

const buildConfigSet = proxyquire('../../lib/utils/build-config-set', {
  './config-set-builder': MockBuilder
});

const makeGasket = () => ({
  execApply: sinon.stub().callsFake(),
  logger: {
    info: sinon.stub(),
    error: sinon.stub()
  },
  config: {
    root: '/path/to/app',
    docs: {
      outputDir: '.docs'
    }
  },
  metadata: {
    app: {
      name: 'my-app'
    },
    plugins: [{
      name: 'example-plugin',
      module: {
        name: 'example-plugin',
        hooks: {
          one: f => f
        }
      }
    }, {
      name: '@some/unnamed-plugin',
      module: {
        // nameless plugin
        hooks: {
          one: f => f,
          two: f => f
        }
      }
    }, {
      name: '/path/to/app/plugins/app-plugin',
      module: {
        name: 'app-plugin',
        hooks: {
          one: f => f,
          two: f => f,
          three: f => f
        }
      }
    }],
    presets: [{
      name: 'example-preset'
    }],
    modules: [{
      name: 'example-module'
    }]
  }
});

describe('utils - buildConfigSet', () => {
  let mockGasket;
  let docsSetupCallback, mockHandler, mockDocsSetup;

  beforeEach(async () => {
    sinon.resetHistory();

    mockGasket = makeGasket();

    await buildConfigSet(mockGasket);
    docsSetupCallback = mockGasket.execApply.getCall(0).args[1];

    mockDocsSetup = {
      link: 'README.md#with-hash'
    };

    mockHandler = sinon.stub().resolves(mockDocsSetup);
  });

  it('instantiates a builder', async () => {
    await buildConfigSet(mockGasket);
    assume(builderConstructorStub).calledWith(mockGasket);
  });

  it('adds app', async () => {
    assume(addAppStub).calledWith();
  });

  it('adds plugins from metadata', async () => {
    assume(addPluginsStub).calledWith(mockGasket.metadata.plugins);
  });

  it('adds presets from metadata', async () => {
    assume(addPresetsStub).calledWith(mockGasket.metadata.presets);
  });

  it('adds modules from metadata', async () => {
    assume(addModulesStub).calledWith(mockGasket.metadata.modules);
  });

  it('returns docsConfigSet from builder', async () => {
    getConfigSetStub.resetHistory();
    const results = await buildConfigSet(mockGasket);
    assume(results).eqls(getConfigSetStub.getCall(0).returnValue);
  });

  describe('docsSetup lifecycle', () => {
    beforeEach(async () => {
      sinon.resetHistory();
    });

    it('lifecycle is executed', async () => {
      await buildConfigSet(mockGasket);
      assume(mockGasket.execApply).calledWith('docsSetup', sinon.match.func);
    });

    it('adds app if if plugin is null (from ./lifecycles file)', async () => {
      await docsSetupCallback(null, mockHandler);
      assume(addAppStub).calledWith(mockGasket.metadata.app, mockDocsSetup);
    });

    it('does not add app if no null plugin (from ./lifecycles file)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      assume(addAppStub).not.calledWith(mockGasket.metadata.app, mockDocsSetup);
    });

    it('adds plugin with associated metadata (by name)', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      assume(addPluginStub).calledWith(mockGasket.metadata.plugins[0], mockDocsSetup);
    });

    it('adds plugin with associated metadata (by hooks)', async () => {
      const [one, two] = [f => f, f => f];
      await docsSetupCallback({ hooks: { one, two } }, mockHandler);
      assume(addPluginStub).calledWith(mockGasket.metadata.plugins[1], mockDocsSetup);
    });

    it('does not add plugin if null', async () => {
      await docsSetupCallback(null, mockHandler);
      assume(addPluginStub).not.calledWith(sinon.match.object, mockDocsSetup);
    });

    it('does not add plugin if no metadata found', async () => {
      await docsSetupCallback({ name: 'missing-plugin' }, mockHandler);
      assume(addPluginStub).not.calledWith(sinon.match.object, mockDocsSetup);
    });
  });

  describe('findModuleInfo', () => {
    // TODO
  });
});
