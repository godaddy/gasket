const plugin = require('../');
const assume = require('assume');
const sinon = require('sinon');

const mockPlugin = {
  name: 'mock',
  hooks: {
    metadata: (gasket, metadata) => {
      return {
        ...metadata,
        modified: true
      };
    }
  }
};

const mockAppInfo = {
  name: 'my-app',
  module: null
};

const mockPluginInfo = {
  name: '@gasket/mock-plugin',
  module: mockPlugin,
  from: '@gasket/mock-preset'
};

const mockPresetInfo = {
  name: '@gasket/mock-preset',
  metqadataKey: 'oldMetadataValue',
  module: {
    metadata: {
      metadataKey: 'metadataValue'
    }
  },
  plugins: [mockPluginInfo]
};

const mockLoadedData = {
  presets: [mockPresetInfo],
  plugins: [mockPluginInfo]
};

describe('Metadata plugin', function () {
  let gasket, applyStub, handlerStub;

  beforeEach(function () {
    applyStub = sinon.stub();
    handlerStub = sinon.stub();

    gasket = {
      loader: {
        loadConfigured: sinon.stub().returns(mockLoadedData),
        getModuleInfo: sinon.stub().returns(mockAppInfo)
      },
      config: {
        plugins: {
          presets: ['mock']
        }
      },
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn({ name: 'mock' }, (meta) => {
          handlerStub(meta);
          return mockPlugin.hooks.metadata(gasket, meta);
        });
      }
    };
  });

  it('is named correctly', function () {
    assume(plugin.name).equals('metadata');
  });

  it('has an init hook', function () {
    assume(plugin.hooks.init).exists();
  });

  describe('init', () => {

    beforeEach(async () => {
      await plugin.hooks.init(gasket);
    });

    it('loads config from gasket.loader instance', async () => {
      assume(gasket.loader.loadConfigured).called();
    });

    it('assigns gasket.metadata', async () => {
      assume(gasket).property('metadata');
    });

    it('adds moduleInfo for app', async () => {
      assume(gasket.metadata).property('app');
    });

    it('adds presetInfo from loaded config', async () => {
      assume(gasket.metadata).property('presets');
    });

    it('adds pluginInfo from loaded config', async () => {
      assume(gasket.metadata).property('plugins');
    });

    it('clones loaded data', async () => {
      assume(gasket.metadata).not.equals(mockLoadedData);
      assume(gasket.metadata.presets[0].module).not.equals(mockPresetInfo.module);
    });

    it('sanitizes loaded data', async () => {
      assume(gasket.metadata.plugins[0].module.hooks.metadata.name).equals('redacted');
    });

    it('relinks plugin instances to preset children (broken by clone)', async () => {
      assume(gasket.metadata.presets[0].plugins[0]).equals(gasket.metadata.plugins[0]);
      gasket.metadata.plugins[0].something = 'changed';
      assume(gasket.metadata.presets[0].plugins[0]).property('something', 'changed');
    });

    it('executes the metadata lifecycle', async function () {
      assume(applyStub.calledOnce).is.true();
    });

    it('metadata hook is passed only metadata for hooking plugin', async function () {
      assume(handlerStub).called();
      assume(handlerStub.getCall(0).args[0]).property('name', '@gasket/mock-plugin');
    });

    it('augments the metadata with data from the lifecycle hooks', async function () {
      assume(gasket.metadata.plugins[0]).property('modified', true);
    });

    it('loads preset metadata and overrides it if collision found', function () {
      assume(gasket.metadata.presets[0]).property('metadataKey', 'metadataValue');
    });

  });
});
