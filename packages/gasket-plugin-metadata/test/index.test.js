/* eslint-disable max-statements */

const plugin = require('../');
const assume = require('assume');
const sinon = require('sinon');

const mockPlugin = {
  name: 'mock',
  hooks: {
    metadata: (gasket, metadata) => {
      return {
        ...metadata,
        modified: true,
        modules: [
          { name: 'fake-one', extra: true },
          { name: 'fake-two', extra: true },
          'fake-three'
        ]
      };
    }
  }
};

const mockPluginInfo = {
  name: '@gasket/plugin-mock',
  module: mockPlugin,
  from: '@gasket/mock-preset'
};

const mockPresetInfo = {
  name: '@gasket/mock-preset',
  metadataKey: 'oldMetadataValue',
  module: {
    metadata: {
      metadataKey: 'metadataValue'
    }
  },
  plugins: [mockPluginInfo]
};

const mockInfo = {
  name: '@gasket/mock',
  module: {}
};

const fakeOneInfo = {
  name: 'fake-one',
  module: {}
};

const fakeTwoInfo = {
  name: 'fake-two',
  module: {}
};

const fakeThreeInfo = {
  name: 'fake-three',
  module: {},
  package: {
    gasket: {
      metadata: {
        fromPackage: true
      }
    }
  }
};

const mockLoadedData = {
  presets: [mockPresetInfo],
  plugins: [mockPluginInfo]
};

describe('Plugin', function () {
  let gasket, applyStub, handlerStub, mockAppInfo;

  beforeEach(function () {
    applyStub = sinon.stub();
    handlerStub = sinon.stub();

    mockAppInfo = {
      name: 'my-app',
      module: null,
      package: {
        dependencies: {
          '@gasket/mock-preset': '^1.2.3',
          '@gasket/plugin-mock': '^10.0.0',
          '@gasket/mock': '^20.0.0',
          'fake-one': '^30.0.0'
        }
      }
    };

    gasket = {
      loader: {
        loadConfigured: sinon.stub().returns(mockLoadedData),
        getModuleInfo: sinon.stub().callsFake((module, name, meta = {}) => {
          const found = {
            'my-app': mockAppInfo,
            '@gasket/mock': mockInfo,
            'fake-one': fakeOneInfo,
            'fake-two': fakeTwoInfo,
            'fake-three': fakeThreeInfo
          }[name] || mockAppInfo;

          return { ...found, ...meta };
        })
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

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'init',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
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

    it('augments moduleInfo with gasket.metadata from package.json', async () => {
      assume(gasket.metadata.app).not.property('fromPackage');

      mockAppInfo.package.gasket = { metadata: { fromPackage: true } };
      await plugin.hooks.init(gasket);
      assume(gasket.metadata.app).property('fromPackage', true);
    });

    it('adds presetInfo from loaded config', async () => {
      assume(gasket.metadata).property('presets');
    });

    it('adds pluginInfo from loaded config', async () => {
      assume(gasket.metadata).property('plugins');
    });

    it('adds moduleInfo from app dependencies', async () => {
      assume(gasket.metadata.modules).gt(0);
      const names = gasket.metadata.modules.map(m => m.name);
      assume(names).includes('@gasket/mock');
      assume(names).includes('fake-one');
    });

    it('ignores plugins and presets from app dependencies', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      assume(names).not.includes('@gasket/plugin-mock');
      assume(names).not.includes('@gasket/mock-preset');
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
      assume(handlerStub.getCall(0).args[0]).property('name', '@gasket/plugin-mock');
    });

    it('augments the metadata with data from the lifecycle hooks', async function () {
      assume(gasket.metadata.plugins[0]).property('modified', true);
    });

    it('loads moduleInfo for modules declared in plugin metadata', async () => {
      const names = gasket.metadata.plugins[0].modules.map(m => m.name);
      assume(names).includes('fake-one');
      assume(names).includes('fake-two');
      assume(names).includes('fake-three');
    });

    it('augments moduleInfo metadata for modules declared modules', async () => {
      const result = gasket.metadata.plugins[0].modules.find(mod => mod.name === 'fake-one');
      assume(result).property('extra', true);
    });

    it('flattens moduleInfo from plugins', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      assume(names).includes('fake-one');
      assume(names).includes('fake-two');
      assume(names).includes('fake-three');
    });

    it('flatting does not duplicate moduleInfo', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      assume(names.filter(n => n === 'fake-one')).lengthOf(1);
    });

    it('flatting augments moduleInfo with extras from plugins', async () => {
      const result = gasket.metadata.modules.find(mod => mod.name === 'fake-one');
      assume(result).property('extra', true);
    });

    it('augments moduleInfo with extras package.json', async () => {
      const result = gasket.metadata.modules.find(mod => mod.name === 'fake-three');
      assume(result).property('fromPackage', true);
    });

    it('loads preset metadata', async function () {
      await plugin.hooks.init(gasket);
      assume(gasket.metadata.presets[0]).property('metadataKey', 'metadataValue');
    });
  });

  describe('metadata', () => {

    it('retains acquired plugin data', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      assume(results).property('name', '@gasket/plugin-mock');
    });

    it('adds lifecycles', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      assume(results).property('lifecycles');
    });
  });
});
