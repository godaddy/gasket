const assume = require('assume');
const sinon = require('sinon');
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
      assume(results).equals(target);
    });

    it('redacts functions', () => {
      const mockFn = f => f;
      const results = sanitize(mockFn);

      assume(results).a('function');
      assume(results).not.equals(mockFn);
      assume(results.name).equals('redacted');
    });

    it('redacts functions which are object properties', () => {
      const mockFn = f => f;
      const target = { some: 'data', fn: mockFn };
      assume(target.fn).equals(mockFn);

      const results = sanitize(target);
      assume(results.fn).a('function');
      assume(results.fn).not.equals(mockFn);
      assume(results.fn.name).equals('redacted');
    });

    it('does recurse through objects', () => {
      const mockFn = f => f;
      const target = { some: 'data', deep: { fn: mockFn } };

      const results = sanitize(target);
      assume(results.deep.fn).a('function');
      assume(results.deep.fn).not.equals(mockFn);
      assume(results.deep.fn.name).equals('redacted');
    });

    it('redacts functions within arrays', () => {
      const mockFn = f => f;
      const target = { some: 'data', fns: [mockFn, mockFn] };

      const results = sanitize(target);

      results.fns.forEach(fn => {
        assume(fn).a('function');
        assume(fn).not.equals(mockFn);
        assume(fn.name).equals('redacted');
      });
    });

    it('does not transform non-function properties', () => {
      assume(sanitize(1)).equals(1);
      assume(sanitize('a')).equals('a');
      assume(sanitize([1, 'a'])).deep.equals([1, 'a']);
    });
  });

  describe('safeAssign', () => {
    it('assigns missing keys to target', () => {
      const target = {};
      safeAssign(target, { one: 1 });
      assume(target).eqls({ one: 1 });
    });

    it('does not override existing keys', () => {
      const target = { two: 2 };
      safeAssign(target, { one: 1 });
      assume(target).eqls({ two: 2, one: 1 });
    });
  });

  describe('loadAppModules', () => {
    let mockLoader, mockApp, mockModules;

    const mockModuleData = {
      name: 'fake-one'
    };

    beforeEach(() => {
      mockLoader = {
        getModuleInfo: sinon.stub().callsFake((mod, name, meta) => ({ ...mockModuleData, ...meta }))
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
      assume(mockApp).property('modules');
      assume(mockApp.modules).lengthOf(1);
      assume(mockApp.modules[0]).property('name', 'fake-one');
    });

    it('adds moduleData to modules metadata', () => {
      loadAppModules(mockLoader, mockApp, mockModules);
      assume(mockModules).lengthOf(1);
      assume(mockModules[0]).property('name', 'fake-one');
    });

    it('moduleData includes range and from', () => {
      loadAppModules(mockLoader, mockApp, mockModules);
      assume(mockModules[0]).property('range', '^1.2.3');
      assume(mockModules[0]).property('from', 'my-app');
    });

    it('ignores plugins and presets', () => {
      mockApp.package.dependencies['@gasket/plugin-mock'] = '1.2.3';
      mockApp.package.dependencies['@gasket/mock-preset'] = '3.2.1';
      loadAppModules(mockLoader, mockApp, mockModules);
      assume(mockModules).lessThan(Object.keys(mockApp.package.dependencies).length);
      assume(mockModules).lengthOf(1);
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
        getModuleInfo: sinon.stub().callsFake((mod, name, meta) => ({ ...mockModuleData, ...meta }))
      };
    });

    it('loads moduleData for plugin modules', () => {
      loadPluginModules(mockPluginData, mockLoader);
      assume(mockPluginData).property('modules');
      assume(mockPluginData.modules).lengthOf(1);
      assume(mockPluginData.modules[0]).property('version', '1.2.3');
    });

    it('normalize modules strings to objects', () => {
      loadPluginModules(mockPluginData, mockLoader);
      assume(mockLoader.getModuleInfo).calledWithMatch(null, 'fake-one', { name: 'fake-one' });
    });

    it('ignores if no modules declared', () => {
      delete mockPluginData.modules;
      loadPluginModules(mockPluginData, mockLoader);
      assume(mockPluginData.modules).not.exists();
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
      assume(mockModules).lengthOf(1);
    });

    it('does not duplicate modules', () => {
      mockModules.push(mockModuleData);
      flattenPluginModules(mockPluginData, mockModules);
      assume(mockModules).lengthOf(1);
    });

    it('augments existing module entries', () => {
      mockModules.push(mockModuleData);
      mockPluginData.modules = [{
        ...mockModuleData,
        extra: true
      }];
      flattenPluginModules(mockPluginData, mockModules);
      assume(mockModules[0]).property('extra', true);
    });

    it('ignores if no modules declared', () => {
      delete mockPluginData.modules;
      flattenPluginModules(mockPluginData, mockModules);
      assume(mockModules).empty();
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
      assume(mockPresetData.plugins).includes(mockPluginData);
      assume(mockPresetData.plugins).not.includes(mockModifiedPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockPresetData]);
      assume(mockPresetData.plugins).not.includes(mockPluginData);
      assume(mockPresetData.plugins).includes(mockModifiedPluginData);
    });

    it('assigns pluginData based on `from` attribute', () => {
      mockPresetData.name = 'bogus';
      assume(mockPresetData.plugins).includes(mockPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockPresetData]);
      assume(mockPresetData.plugins).includes(mockPluginData);
    });

    it('assigns modified pluginData instance to deep presets', () => {
      const mockDeepPreset = {
        name: '@gasket/deep-preset',
        presets: [mockPresetData]
      };
      assume(mockPresetData.plugins).includes(mockPluginData);
      fixupPresetHierarchy(mockModifiedPluginData, [mockDeepPreset]);
      assume(mockPresetData.plugins).not.includes(mockPluginData);
      assume(mockPresetData.plugins).includes(mockModifiedPluginData);
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
      assume(mockPresetOne).deep.equals({
        name: '@gasket/one-preset'
      });
    });

    it('does nothing if no module.metadata', async function () {
      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).deep.equals({
        name: '@gasket/one-preset',
        module: {}
      });
    });

    it('adds properties from module.metadata to top', async function () {
      mockPresetOne.module.metadata = { extra: true };
      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).property('extra', true);
    });

    it('augments properties from package.json gasket.metadata', async function () {
      expandPresetMetadata([mockPresetTwo]);
      assume(mockPresetTwo).property('fromPackage', true);
    });

    it('overrides metadata from module.metadata', async function () {
      mockPresetOne.metadataKey = 'oldMetadataValue';
      mockPresetOne.module.metadata = { metadataKey: 'metadataValue' };
      assume(mockPresetOne).property('metadataKey', 'oldMetadataValue');

      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).property('metadataKey', 'metadataValue');
    });

    it('handles multiple presets', async function () {
      mockPresetOne.module.metadata = { extra: 1 };
      mockPresetTwo.module.metadata = { extra: 2 };
      expandPresetMetadata([mockPresetOne, mockPresetTwo]);
      assume(mockPresetOne).property('extra', 1);
      assume(mockPresetTwo).property('extra', 2);
    });

    it('handles recursive/extended presets', async function () {
      mockPresetOne.module.metadata = { extra: 1 };
      mockPresetOne.presets = [mockPresetTwo];
      mockPresetTwo.module.metadata = { extra: 2 };
      mockPresetTwo.presets = [mockPresetThree];
      mockPresetThree.module.metadata = { extra: 3 };
      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).property('extra', 1);
      assume(mockPresetTwo).property('extra', 2);
      assume(mockPresetThree).property('extra', 3);
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
      assume(mockPresetOne).deep.equals({
        name: '@gasket/one-preset'
      });
    });

    it('augments properties with gasket.metadata from package.json', async function () {
      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).property('fromPackage', true);
    });

    it('does not override existing metadata', async function () {
      mockPresetOne.package.gasket.metadata.fromPackage = 'Okay!';
      expandPresetMetadata([mockPresetOne]);
      assume(mockPresetOne).property('fromPackage', 'Okay!');
    });
  });
});
