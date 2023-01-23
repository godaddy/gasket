const {
  sanitize,
  safeAssign,
  loadAppModules,
  loadPluginModules,
  flattenPluginModules,
  fixupPresetHierarchy,
  expandPresetMetadata
} = require('../lib/utils');

describe('Utils', () => {

  describe('sanitize', () => {

    it('returns transformed object', () => {
      const target = { some: 'data' };
      const results = sanitize(target);
      expect(results).toEqual(target);
    });

    it('redacts functions', () => {
      const mockFn = f => f;
      const results = sanitize(mockFn);

      expect(typeof results).toBe('function');
      expect(results).not.toEqual(mockFn);
      expect(results.name).toEqual('redacted');
    });

    it('redacts functions which are object properties', () => {
      const mockFn = f => f;
      const target = { some: 'data', fn: mockFn };
      expect(target.fn).toEqual(mockFn);

      const results = sanitize(target);
      expect(typeof results.fn).toBe('function');
      expect(results.fn).not.toEqual(mockFn);
      expect(results.fn.name).toEqual('redacted');
    });

    it('does recurse through objects', () => {
      const mockFn = f => f;
      const target = { some: 'data', deep: { fn: mockFn } };

      const results = sanitize(target);
      expect(typeof results.deep.fn).toBe('function');
      expect(results.deep.fn).not.toEqual(mockFn);
      expect(results.deep.fn.name).toEqual('redacted');
    });

    it('redacts functions within arrays', () => {
      const mockFn = f => f;
      const target = { some: 'data', fns: [mockFn, mockFn] };

      const results = sanitize(target);

      results.fns.forEach(fn => {
        expect(typeof fn).toBe('function');
        expect(fn).not.toEqual(mockFn);
        expect(fn.name).toEqual('redacted');
      });
    });

    it('does not transform non-function properties', () => {
      expect(sanitize(1)).toEqual(1);
      expect(sanitize('a')).toEqual('a');
      expect(sanitize([1, 'a'])).toEqual([1, 'a']);
    });
  });

  describe('safeAssign', () => {
    it('assigns missing keys to target', () => {
      const target = {};
      safeAssign(target, { one: 1 });
      expect(target).toEqual({ one: 1 });
    });

    it('does not override existing keys', () => {
      const target = { two: 2 };
      safeAssign(target, { one: 1 });
      expect(target).toEqual({ two: 2, one: 1 });
    });
  });

  describe('loadAppModules', () => {
    let mockLoader, mockApp, mockModules;

    const mockModuleData = {
      name: 'fake-one'
    };

    beforeEach(() => {
      mockLoader = {
        getModuleInfo: jest.fn().mockImplementation((mod, name, meta) => ({ ...mockModuleData, ...meta }))
      };
      mockApp = {
        name: 'my-app',
        package: {
          dependencies: {
            'fake-one': '^1.2.3'
          }
        }
      };
      mockModules = [];
    });

    it('loads moduleData for app dependencies', () => {
      loadAppModules(mockLoader, mockApp, mockModules);
      expect(mockApp).toHaveProperty('modules');
      expect(mockApp.modules).toHaveLength(1);
      expect(mockApp.modules[0]).toHaveProperty('name', 'fake-one');
    });

    it('adds moduleData to modules metadata', () => {
      loadAppModules(mockLoader, mockApp, mockModules);
      expect(mockModules).toHaveLength(1);
      expect(mockModules[0]).toHaveProperty('name', 'fake-one');
    });

    it('moduleData includes range and from', () => {
      loadAppModules(mockLoader, mockApp, mockModules);
      expect(mockModules[0]).toHaveProperty('range', '^1.2.3');
      expect(mockModules[0]).toHaveProperty('from', 'my-app');
    });

    it('ignores plugins and presets', () => {
      mockApp.package.dependencies['@gasket/plugin-mock'] = '1.2.3';
      mockApp.package.dependencies['@gasket/mock-preset'] = '3.2.1';
      loadAppModules(mockLoader, mockApp, mockModules);
      expect(mockModules.length).toBeLessThan(Object.keys(mockApp.package.dependencies).length);
      expect(mockModules).toHaveLength(1);
    });
  });

  describe('loadPluginModules', () => {
    let mockLoader;

    const mockPluginData = {
      name: '@gasket/plugin-mock',
      modules: ['fake-one']
    };

    const mockModuleData = {
      name: 'fake-one',
      version: '1.2.3'
    };

    beforeEach(() => {
      mockLoader = {
        getModuleInfo: jest.fn().mockImplementation((mod, name, meta) => ({ ...mockModuleData, ...meta }))
      };
    });

    it('loads moduleData for plugin modules', () => {
      loadPluginModules(mockPluginData, mockLoader);
      expect(mockPluginData).toHaveProperty('modules');
      expect(mockPluginData.modules).toHaveLength(1);
      expect(mockPluginData.modules[0]).toHaveProperty('version', '1.2.3');
    });

    it('normalize modules strings to objects', () => {
      loadPluginModules(mockPluginData, mockLoader);
      expect(mockLoader.getModuleInfo).toHaveBeenCalledWith(null, 'fake-one', { name: 'fake-one', version: expect.any(String) });
    });

    it('ignores if no modules declared', () => {
      delete mockPluginData.modules;
      loadPluginModules(mockPluginData, mockLoader);
      expect(mockPluginData.modules).toBeFalsy();
    });
  });

  describe('flattenPluginModules', () => {
    let mockModules;

    const mockModuleData = {
      name: 'fake-one',
      version: '1.2.3'
    };

    const mockPluginData = {
      name: '@gasket/plugin-mock',
      modules: [mockModuleData]
    };

    beforeEach(() => {
      mockModules = [];
    });

    it('push moduleData on plugins to top-level modules array', () => {
      flattenPluginModules(mockPluginData, mockModules);
      expect(mockModules).toHaveLength(1);
    });

    it('does not duplicate modules', () => {
      mockModules.push(mockModuleData);
      flattenPluginModules(mockPluginData, mockModules);
      expect(mockModules).toHaveLength(1);
    });

    it('augments existing module entries', () => {
      mockModules.push(mockModuleData);
      mockPluginData.modules = [{
        ...mockModuleData,
        extra: true
      }];
      flattenPluginModules(mockPluginData, mockModules);
      expect(mockModules[0]).toHaveProperty('extra', true);
    });

    it('ignores if no modules declared', () => {
      delete mockPluginData.modules;
      flattenPluginModules(mockPluginData, mockModules);
      expect(mockModules).toHaveLength(0);
    });
  });

  describe('fixupPresetHierarchy', () => {
    let mockPresetData;

    const mockPluginData = {
      name: '@gasket/plugin-mock',
      from: '@gasket/mock-preset'
    };

    const mockModifiedPluginData = {
      name: '@gasket/plugin-mock',
      from: '@gasket/mock-preset',
      extra: true
    };

    beforeEach(() => {
      mockPresetData = {
        name: '@gasket/mock-preset',
        plugins: [mockPluginData]
      };
    });

    it('assigns modified pluginData instance to parent presets', () => {
      expect(mockPresetData.plugins).toContain(mockPluginData);
      expect(mockPresetData.plugins).not.toContain(mockModifiedPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockPresetData]);
      expect(mockPresetData.plugins).not.toContain(mockPluginData);
      expect(mockPresetData.plugins).toContain(mockModifiedPluginData);
    });

    it('assigns pluginData based on `from` attribute', () => {
      mockPresetData.name = 'bogus';
      expect(mockPresetData.plugins).toContain(mockPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockPresetData]);
      expect(mockPresetData.plugins).toContain(mockPluginData);
    });

    it('assigns modified pluginData instance to deep presets', () => {
      const mockDeepPreset = {
        name: '@gasket/deep-preset',
        presets: [mockPresetData]
      };
      expect(mockPresetData.plugins).toContain(mockPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockDeepPreset]);
      expect(mockPresetData.plugins).not.toContain(mockPluginData);
      expect(mockPresetData.plugins).toContain(mockModifiedPluginData);
    });
  });

  describe('expandPresetMetadata', () => {
    let mockPresetOne, mockPresetTwo, mockPresetThree;

    beforeEach(() => {
      mockPresetOne = {
        name: '@gasket/one-preset',
        module: {}
      };
      mockPresetTwo = {
        name: '@gasket/two-preset',
        module: {},
        package: {
          gasket: {
            metadata: {
              fromPackage: true
            }
          }
        }
      };
      mockPresetThree = {
        name: '@gasket/three-preset',
        module: {}
      };
    });

    it('does nothing if no module', async function () {
      delete mockPresetOne.module;
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toEqual({
        name: '@gasket/one-preset'
      });
    });

    it('does nothing if no module.metadata', async function () {
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toEqual({
        name: '@gasket/one-preset',
        module: {}
      });
    });

    it('adds properties from module.metadata to top', async function () {
      mockPresetOne.module.metadata = { extra: true };
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toHaveProperty('extra', true);
    });

    it('augments properties from package.json gasket.metadata', async function () {
      expandPresetMetadata([mockPresetTwo]);
      expect(mockPresetTwo).toHaveProperty('fromPackage', true);
    });

    it('overrides metadata from module.metadata', async function () {
      mockPresetOne.metadataKey = 'oldMetadataValue';
      mockPresetOne.module.metadata = { metadataKey: 'metadataValue' };
      expect(mockPresetOne).toHaveProperty('metadataKey', 'oldMetadataValue');

      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toHaveProperty('metadataKey', 'metadataValue');
    });

    it('handles multiple presets', async function () {
      mockPresetOne.module.metadata = { extra: 1 };
      mockPresetTwo.module.metadata = { extra: 2 };
      expandPresetMetadata([mockPresetOne, mockPresetTwo]);
      expect(mockPresetOne).toHaveProperty('extra', 1);
      expect(mockPresetTwo).toHaveProperty('extra', 2);
    });

    it('handles recursive/extended presets', async function () {
      mockPresetOne.module.metadata = { extra: 1 };
      mockPresetOne.presets = [mockPresetTwo];
      mockPresetTwo.module.metadata = { extra: 2 };
      mockPresetTwo.presets = [mockPresetThree];
      mockPresetThree.module.metadata = { extra: 3 };
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toHaveProperty('extra', 1);
      expect(mockPresetTwo).toHaveProperty('extra', 2);
      expect(mockPresetThree).toHaveProperty('extra', 3);
    });
  });

  describe('expandPackageMetadata', () => {
    let mockPresetOne;

    beforeEach(() => {
      mockPresetOne = {
        name: '@gasket/one-preset',
        package: {
          gasket: {
            metadata: {
              fromPackage: true
            }
          }
        }
      };
    });

    it('does nothing if no package', async function () {
      delete mockPresetOne.package;
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toEqual({
        name: '@gasket/one-preset'
      });
    });

    it('augments properties with gasket.metadata from package.json', async function () {
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toHaveProperty('fromPackage', true);
    });

    it('does not override existing metadata', async function () {
      mockPresetOne.package.gasket.metadata.fromPackage = 'Okay!';
      expandPresetMetadata([mockPresetOne]);
      expect(mockPresetOne).toHaveProperty('fromPackage', 'Okay!');
    });
  });
});
