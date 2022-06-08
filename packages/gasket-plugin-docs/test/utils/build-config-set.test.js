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
const mockLogger = {
  info: sinon.stub(),
  error: sinon.stub()
};

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

const mockDefaults = { link: 'FAKE.md#bogus' };
MockBuilder.docsSetupDefault = mockDefaults;

const buildConfigSet = proxyquire('../../lib/utils/build-config-set', {
  './config-set-builder': MockBuilder
});

const { findPluginData } = buildConfigSet;

const makeGasket = () => ({
  execApply: sinon.stub().callsFake(),
  logger: mockLogger,
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
      name: '@another/unnamed-plugin',
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

    it('docsSetup defaults are available to app-level hooks', async () => {
      await docsSetupCallback(null, mockHandler);
      assume(mockHandler).calledWith(sinon.match.object);
      assume(mockHandler.getCall(0).args[0]).property('defaults', mockDefaults);
    });

    it('docsSetup defaults are available to plugin-level hooks', async () => {
      await docsSetupCallback({ name: 'example-plugin' }, mockHandler);
      assume(mockHandler).calledWith(sinon.match.object);
      assume(mockHandler.getCall(0).args[0]).property('defaults', mockDefaults);
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
      await docsSetupCallback({ hooks: { one: f => f } }, mockHandler);
      assume(addPluginStub).calledWith(mockGasket.metadata.plugins[0], mockDocsSetup);
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

  describe('findPluginData', () => {
    let mockPluginDatas;

    beforeEach(() => {
      mockPluginDatas = mockGasket.metadata.plugins;
    });

    it('returns found pluginData from plugin name', () => {
      const result = findPluginData({ name: 'example-plugin' }, mockPluginDatas, mockLogger);
      assume(result).equals(mockPluginDatas[0]);
      assume(mockLogger.error).not.called();
    });

    it('logs error if no pluginData found', () => {
      const result = findPluginData({ name: 'missing-plugin' }, mockPluginDatas, mockLogger);
      assume(result).not.exists();
      assume(mockLogger.error).calledWithMatch('Unable to find pluginData');
    });

    describe('when plugin missing name', () => {

      it('returns found pluginData from plugin hooks', () => {
        const result = findPluginData({ hooks: { one: f => f } }, mockPluginDatas, mockLogger);
        assume(result).equals(mockPluginDatas[0]);
        assume(mockLogger.error).not.called();
      });

      it('no return value if no pluginData found', () => {
        const result = findPluginData({ hooks: { missing: f => f } }, mockPluginDatas, mockLogger);
        assume(result).not.exists();
      });

      it('logs info for found plugin', () => {
        const result = findPluginData({ hooks: { one: f => f } }, mockPluginDatas, mockLogger);
        assume(result).equals(mockPluginDatas[0]);
        assume(mockLogger.info).calledWithMatch('Determined plugin with missing name');
      });

      it('logs error if multiple plugins with matching hooks', () => {
        const result = findPluginData({ hooks: { one: f => f, two: f => f } }, mockPluginDatas, mockLogger);
        assume(result).not.exists();
        assume(mockLogger.error).calledWithMatch('More than one pluginData');
      });

      it('logs error if no match found', () => {
        const result = findPluginData({ hooks: { missing: f => f } }, mockPluginDatas, mockLogger);
        assume(result).not.exists();
        assume(mockLogger.error).calledWithMatch('Unable to find pluginData');
      });
    });
  });
});
