const Loader = require('../lib/loader');
const { makeRequire } = require('./helpers');

let mockRequire;

const presetOne = {};
const presetTwo = {};
const presetUser = {};
const pluginOne = { name: 'one' };
const pluginTwo = { name: 'two' };
const pluginUser = { name: 'user' };
const presetOnePkg = {
  name: '@gasket/one-preset',
  version: '4.5.6',
  dependencies: {
    '@gasket/one-plugin': '^1.0.0',
    'some-module': 'latest'
  }
};
const presetTwoPkg = {
  name: '@gasket/two-preset',
  version: '4.5.7',
  dependencies: {
    '@gasket/one-plugin': 'latest',
    '@gasket/two-plugin': '^1.0.0',
    '@gasket/one-preset': '^4.0.0',
    'some-module': 'latest'
  }
};
const presetUserPkg = {
  name: 'user-preset',
  version: '4.5.8', dependencies: {
    'user-plugin': '^1.0.0'
  }
};
const pluginOnePkg = { name: '@gasket/one-plugin', version: '1.2.3' };
const pluginTwoPkg = { name: '@gasket/two-plugin', version: '1.2.4' };
const pluginUserPkg = { name: 'user-plugin', version: '1.2.5' };
const appPluginOne = { name: 'app-one-plugin', version: '7.8.9' };
const appPluginTwo = { name: 'app-two-plugin', version: '7.8.10' };

const mockModules = {
  '@gasket/one-preset': presetOne,
  '@gasket/two-preset': presetTwo,
  'user-preset': presetUser,
  '@gasket/one-plugin': pluginOne,
  '@gasket/two-plugin': pluginTwo,
  'user-plugin': pluginUser,
  '@gasket/one-preset/package.json': presetOnePkg,
  '@gasket/two-preset/package.json': presetTwoPkg,
  'user-preset/package.json': presetUserPkg,
  '@gasket/one-plugin/package.json': pluginOnePkg,
  '@gasket/two-plugin/package.json': pluginTwoPkg,
  'user-plugin/package.json': pluginUserPkg,
  '/app/plugins/app-one-plugin.js': appPluginOne,
  '/app/plugins/app-two-plugin.js': appPluginTwo
};

describe('Loader', () => {
  let loader;

  beforeEach(() => {
    mockRequire = makeRequire(mockModules);
    presetOne.require = makeRequire(mockModules);
    presetTwo.require = makeRequire(mockModules);

    loader = new Loader({ require: mockRequire });
  });

  it('extends Resolver', () => {
    expect(loader).toBeInstanceOf(require('../lib/resolver'));
  });

  it('exposes expected methods', () => {
    expect(loader.getModuleInfo).toBeDefined();
    expect(loader.loadModule).toBeDefined();
    expect(loader.loadPreset).toBeDefined();
    expect(loader.loadPlugin).toBeDefined();
    expect(loader.loadConfigured).toBeDefined();
  });

  it('accepts Resolver params', () => {
    loader = new Loader({ resolveFrom: '/some/path', require: mockRequire });
    expect(loader._resolveFrom).toBeDefined();
    expect(loader._require).toBe(mockRequire);
  });

  describe('.getModuleInfo', () => {

    it('returns info object', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/one-plugin');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        module: pluginOne
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('tries to resolve package.json', () => {
      loader.getModuleInfo(pluginOne, '@gasket/one-plugin', { extra: true });
      expect(mockRequire.resolve).toHaveBeenCalledWith('@gasket/one-plugin/package.json', {});
    });

    it('adds package contents if resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        package: pluginOnePkg
      }));
    });

    it('adds path if package resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        path: '/path/to/node_modules/@gasket/one-plugin'
      }));
    });

    it('updates name and version if package resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '/path/to/node_modules/@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        version: '1.2.3'
      }));
    });

    it('ignores package info if does not resolve', () => {
      const results = loader.getModuleInfo(null, 'missing', { extra: true });
      expect(results).not.toHaveProperty('package');
      expect(results).not.toHaveProperty('path');
      expect(results).not.toHaveProperty('version');
    });
  });

  describe('.loadModule', () => {

    it('returns info object', () => {
      const results = loader.loadModule('@gasket/one-plugin');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadModule('@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('throws if missing module', () => {
      expect(() => loader.loadModule('missing')).toThrow();
    });
  });

  describe('.loadPlugin', () => {

    it('returns info object', () => {
      const results = loader.loadPlugin('@gasket/one-plugin');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadPlugin('@gasket/one-plugin', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('throws if missing module', () => {
      expect(() => loader.loadPlugin('missing')).toThrow();
    });

    it('supports short names', () => {
      const results = loader.loadPlugin('one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('supports module paths', () => {
      const results = loader.loadPlugin('/app/plugins/app-one-plugin.js');
      expect(results).toEqual(expect.objectContaining({
        name: '/app/plugins/app-one-plugin.js',
        module: appPluginOne
      }));
    });

    it('supports preloaded modules - built-ins', () => {
      const results = loader.loadPlugin(pluginOne);
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-plugin',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('add preloaded tag to info object', () => {
      const results = loader.loadPlugin(pluginUser);
      expect(results).toHaveProperty('preloaded');
    });
  });

  describe('.loadPreset', () => {

    it('returns info object', () => {
      const results = loader.loadPreset('@gasket/one-preset');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-preset',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadPreset('@gasket/one-preset', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('throws if missing module', () => {
      expect(() => loader.loadPreset('missing')).toThrow();
    });

    it('supports short names', () => {
      const results = loader.loadPreset('one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-preset',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('supports module paths', () => {
      const results = loader.loadPreset('/path/to/node_modules/@gasket/one-preset');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/one-preset',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('loads plugin dependencies', () => {
      const results = loader.loadPreset('@gasket/one-preset');
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
    });

    it('loads preset dependencies', () => {
      const results = loader.loadPreset('@gasket/two-preset');
      expect(results.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: presetOne
          })
        ])
      );
    });

    it('adds meta data from parent preset', () => {
      const results = loader.loadPreset('@gasket/one-preset');
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            from: '@gasket/one-preset',
            range: '^1.0.0'
          })
        ])
      );
    });

    it('does not load non plugin/preset dependencies', () => {
      const results = loader.loadPreset('@gasket/two-preset');
      const count = Object.keys(results.package.dependencies).length;
      expect(results.presets.length + results.plugins.length).toBeLessThan(count);
      expect(results.plugins).toHaveLength(2);
      expect(results.presets).toHaveLength(1);
    });

    it('uses require from preset to load its dependencies', () => {
      loader.loadPreset('@gasket/two-preset');
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('two-preset'));
      expect(mockRequire).not.toHaveBeenCalledWith(expect.stringContaining('one-preset'));
      expect(mockRequire).not.toHaveBeenCalledWith(expect.stringContaining('one-plugin'));

      expect(presetTwo.require).toHaveBeenCalledWith(expect.stringContaining('one-preset'));

      expect(presetOne.require).toHaveBeenCalledWith(expect.stringContaining('one-plugin'));
    });

    it('uses default require if not provide by preset', () => {
      loader.loadPreset('user-preset');
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('user-preset'));
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('user-plugin'));
    });

    it('shallow does not loads preset dependencies', () => {
      const results = loader.loadPreset('@gasket/one-preset', {}, { shallow: true });
      expect(results.plugins).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: '@gasket/one-plugin',
            module: null,
            from: '@gasket/one-preset'
          })
        ])
      );
    });
  });

  describe('.loadConfigured', () => {

    it('returns object with arrays for presets and plugins', () => {
      const results = loader.loadConfigured();
      expect(results).toEqual({
        plugins: expect.any(Array),
        presets: expect.any(Array)
      });
    });

    it('loads configured plugins', () => {
      const config = {
        add: ['@gasket/one-plugin']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
    });

    it('loads configured presets', () => {
      const config = {
        presets: ['@gasket/one-preset']
      };
      const results = loader.loadConfigured(config);
      expect(results.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: presetOne
          })
        ])
      );
    });

    it('add from=config to info', () => {
      const config = {
        add: ['@gasket/one-plugin']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne,
            from: 'config'
          })
        ])
      );
    });

    it('supports short names', () => {
      const config = {
        presets: ['one'],
        add: ['one']
      };
      const results = loader.loadConfigured(config);
      expect(results.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: presetOne,
            from: 'config'
          })
        ])
      );
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne,
            from: 'config'
          })
        ])
      );
    });

    it('supports path names', () => {
      const config = {
        presets: ['/path/to/node_modules/user-preset'],
        add: ['/app/plugins/app-one-plugin.js']
      };
      const results = loader.loadConfigured(config);
      expect(results.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: presetUser,
            from: 'config'
          })
        ])
      );
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: appPluginOne,
            from: 'config'
          })
        ])
      );
    });

    it('plugins results contains preset plugins', () => {
      const config = {
        presets: ['@gasket/one-preset']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
    });

    it('removes configured plugins', () => {
      const config = {
        presets: ['@gasket/one-preset'],
        remove: ['one']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
    });

    it('dedupes plugins preferring parent preset', () => {
      const config = {
        presets: ['@gasket/two-preset']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne,
            from: '@gasket/two-preset'
          })
        ])
      );
    });

    it('dedupes plugins preferring add plugins', () => {
      const config = {
        presets: ['@gasket/two-preset'],
        add: ['one']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne,
            from: 'config'
          })
        ])
      );
    });

  });

});
