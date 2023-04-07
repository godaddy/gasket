/* eslint-disable max-statements */
const plugin = require('../');

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
    applyStub = jest.fn();
    handlerStub = jest.fn();

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
        loadConfigured: jest.fn().mockReturnValue(mockLoadedData),
        getModuleInfo: jest.fn().mockImplementation((module, name, meta = {}) => {
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
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'init',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('init', () => {

    beforeEach(async () => {
      await plugin.hooks.init(gasket);
    });

    it('loads config from gasket.loader instance', async () => {
      expect(gasket.loader.loadConfigured).toHaveBeenCalled();
    });

    it('assigns gasket.metadata', async () => {
      expect(gasket).toHaveProperty('metadata');
    });

    it('adds moduleInfo for app', async () => {
      expect(gasket.metadata).toHaveProperty('app');
    });

    it('augments moduleInfo with gasket.metadata from package.json', async () => {
      expect(gasket.metadata.app).not.toHaveProperty('fromPackage');

      mockAppInfo.package.gasket = { metadata: { fromPackage: true } };
      await plugin.hooks.init(gasket);
      expect(gasket.metadata.app).toHaveProperty('fromPackage', true);
    });

    it('adds presetInfo from loaded config', async () => {
      expect(gasket.metadata).toHaveProperty('presets');
    });

    it('adds pluginInfo from loaded config', async () => {
      expect(gasket.metadata).toHaveProperty('plugins');
    });

    it('adds moduleInfo from app dependencies', async () => {
      expect(gasket.metadata.modules.length).toBeGreaterThan(0);
      const names = gasket.metadata.modules.map(m => m.name);
      expect(names).toContain('@gasket/mock');
      expect(names).toContain('fake-one');
    });

    it('ignores plugins and presets from app dependencies', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      expect(names).not.toContain('@gasket/plugin-mock');
      expect(names).not.toContain('@gasket/mock-preset');
    });

    it('clones loaded data', async () => {
      expect(gasket.metadata).not.toEqual(mockLoadedData);
      // .not.toStrictEqual() fails
      expect(gasket.metadata.presets[0].module === mockPresetInfo.module).toBe(false);
    });

    it('sanitizes loaded data', async () => {
      expect(gasket.metadata.plugins[0].module.hooks.metadata.name).toEqual('redacted');
    });

    it('relinks plugin instances to preset children (broken by clone)', async () => {
      expect(gasket.metadata.presets[0].plugins[0]).toEqual(gasket.metadata.plugins[0]);
      gasket.metadata.plugins[0].something = 'changed';
      expect(gasket.metadata.presets[0].plugins[0]).toHaveProperty('something', 'changed');
    });

    it('executes the metadata lifecycle', async function () {
      expect(applyStub).toHaveBeenCalledTimes(1);
    });

    it('metadata hook is passed only metadata for hooking plugin', async function () {
      expect(handlerStub).toHaveBeenCalled();
      expect(handlerStub.mock.calls[0][0]).toHaveProperty('name', '@gasket/plugin-mock');
    });

    it('augments the metadata with data from the lifecycle hooks', async function () {
      expect(gasket.metadata.plugins[0]).toHaveProperty('modified', true);
    });

    it('loads moduleInfo for modules declared in plugin metadata', async () => {
      const names = gasket.metadata.plugins[0].modules.map(m => m.name);
      expect(names).toContain('fake-one');
      expect(names).toContain('fake-two');
      expect(names).toContain('fake-three');
    });

    it('augments moduleInfo metadata for modules declared modules', async () => {
      const result = gasket.metadata.plugins[0].modules.find(mod => mod.name === 'fake-one');
      expect(result).toHaveProperty('extra', true);
    });

    it('flattens moduleInfo from plugins', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      expect(names).toContain('fake-one');
      expect(names).toContain('fake-two');
      expect(names).toContain('fake-three');
    });

    it('flatting does not duplicate moduleInfo', async () => {
      const names = gasket.metadata.modules.map(m => m.name);
      expect(names.filter(n => n === 'fake-one')).toHaveLength(1);
    });

    it('flatting augments moduleInfo with extras from plugins', async () => {
      const result = gasket.metadata.modules.find(mod => mod.name === 'fake-one');
      expect(result).toHaveProperty('extra', true);
    });

    it('augments moduleInfo with extras package.json', async () => {
      const result = gasket.metadata.modules.find(mod => mod.name === 'fake-three');
      expect(result).toHaveProperty('fromPackage', true);
    });

    it('loads preset metadata', async function () {
      await plugin.hooks.init(gasket);
      expect(gasket.metadata.presets[0]).toHaveProperty('metadataKey', 'metadataValue');
    });
  });

  describe('metadata', () => {

    it('retains acquired plugin data', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      expect(results).toHaveProperty('name', '@gasket/plugin-mock');
    });

    it('adds lifecycles', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      expect(results).toHaveProperty('lifecycles');
    });
  });
});
