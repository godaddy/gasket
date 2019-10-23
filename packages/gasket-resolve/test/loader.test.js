const Loader = require('../lib/loader');
const { makeRequire } = require('./helpers');

let mockRequire;

const presetOne = {};
const presetTwo = {};
const presetUser = {};
const pluginOne = { name: '@gasket/one' };
const pluginTwo = { name: '@gasket/two' };
const pluginUser = { name: 'user' };
const presetOnePkg = {
  name: '@gasket/preset-one',
  version: '4.5.6',
  dependencies: {
    '@gasket/plugin-one': '^1.0.0',
    'some-module': 'latest'
  }
};
const presetTwoPkg = {
  name: '@gasket/preset-two',
  version: '4.5.7',
  dependencies: {
    '@gasket/plugin-one': 'latest',
    '@gasket/plugin-two': '^1.0.0',
    '@gasket/preset-one': '^4.0.0',
    'some-module': 'latest'
  }
};
const presetUserPkg = {
  name: 'gasket-preset-user',
  version: '4.5.8', dependencies: {
    'gasket-plugin-user': '^1.0.0'
  }
};
const pluginOnePkg = { name: '@gasket/plugin-one', version: '1.2.3' };
const pluginTwoPkg = { name: '@gasket/plugin-two', version: '1.2.4' };
const pluginUserPkg = { name: 'gasket-plugin-user', version: '1.2.5' };
const appPluginOne = { name: 'app-plugin-one', version: '7.8.9' };
const appPluginTwo = { name: 'app-plugin-two', version: '7.8.10' };

const mockModules = {
  '@gasket/preset-one': presetOne,
  '@gasket/preset-two': presetTwo,
  'gasket-preset-user': presetUser,
  '@gasket/plugin-one': pluginOne,
  '@gasket/plugin-two': pluginTwo,
  'gasket-plugin-user': pluginUser,
  '@gasket/preset-one/package.json': presetOnePkg,
  '@gasket/preset-two/package.json': presetTwoPkg,
  'gasket-preset-user/package.json': presetUserPkg,
  '@gasket/plugin-one/package.json': pluginOnePkg,
  '@gasket/plugin-two/package.json': pluginTwoPkg,
  'gasket-plugin-user/package.json': pluginUserPkg,
  '/app/plugins/app-plugin-one.js': appPluginOne,
  '/app/plugins/app-plugin-two.js': appPluginTwo
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
      const results = loader.getModuleInfo(pluginOne, '@gasket/plugin-one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
        module: pluginOne
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/plugin-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('tries to resolve package.json', () => {
      loader.getModuleInfo(pluginOne, '@gasket/plugin-one', { extra: true });
      expect(mockRequire.resolve).toHaveBeenCalledWith('@gasket/plugin-one/package.json', {});
    });

    it('adds package contents if resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/plugin-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        package: pluginOnePkg
      }));
    });

    it('adds path if package resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '@gasket/plugin-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        path: '/path/to/node_modules/@gasket/plugin-one'
      }));
    });

    it('updates name and version if package resolves', () => {
      const results = loader.getModuleInfo(pluginOne, '/path/to/node_modules/@gasket/plugin-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
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
      const results = loader.loadModule('@gasket/plugin-one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadModule('@gasket/plugin-one', { extra: true });
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
      const results = loader.loadPlugin('@gasket/plugin-one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadPlugin('@gasket/plugin-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('throws if missing module', () => {
      expect(() => loader.loadPlugin('missing')).toThrow(/Cannot find module/);
    });

    // TODO: test variants
    it('supports short names', () => {
      const results = loader.loadPlugin('@gasket/one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('supports module paths', () => {
      const results = loader.loadPlugin('/app/plugins/app-plugin-one.js');
      expect(results).toEqual(expect.objectContaining({
        name: '/app/plugins/app-plugin-one.js',
        module: appPluginOne
      }));
    });

    it('supports preloaded modules - built-ins', () => {
      const results = loader.loadPlugin(pluginOne);
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/plugin-one',
        module: pluginOne,
        package: pluginOnePkg
      }));
    });

    it('add preloaded tag to info object', () => {
      const results = loader.loadPlugin(pluginUser, { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true,
        preloaded: true
      }));
    });
  });

  describe('.loadPreset', () => {

    it('returns info object', () => {
      const results = loader.loadPreset('@gasket/preset-one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/preset-one',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('includes passed meta data', () => {
      const results = loader.loadPreset('@gasket/preset-one', { extra: true });
      expect(results).toEqual(expect.objectContaining({
        extra: true
      }));
    });

    it('throws if missing module', () => {
      expect(() => loader.loadPreset('missing')).toThrow();
    });

    // TODO: test variants
    it('supports short names', () => {
      const results = loader.loadPreset('one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/preset-one',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('supports module paths', () => {
      const results = loader.loadPreset('/path/to/node_modules/@gasket/preset-one');
      expect(results).toEqual(expect.objectContaining({
        name: '@gasket/preset-one',
        module: presetOne,
        package: presetOnePkg
      }));
    });

    it('loads plugin dependencies', () => {
      const results = loader.loadPreset('@gasket/preset-one');
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne
          })
        ])
      );
    });

    it('loads preset dependencies', () => {
      const results = loader.loadPreset('@gasket/preset-two');
      expect(results.presets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: presetOne
          })
        ])
      );
    });

    it('adds meta data from parent preset', () => {
      const results = loader.loadPreset('@gasket/preset-one');
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            from: '@gasket/preset-one',
            range: '^1.0.0'
          })
        ])
      );
    });

    it('does not load non plugin/preset dependencies', () => {
      const results = loader.loadPreset('@gasket/preset-two');
      const count = Object.keys(results.package.dependencies).length;
      expect(results.presets.length + results.plugins.length).toBeLessThan(count);
      expect(results.plugins).toHaveLength(2);
      expect(results.presets).toHaveLength(1);
    });

    it('uses require from preset to load its dependencies', () => {
      loader.loadPreset('@gasket/preset-two');
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('preset-two'));
      expect(mockRequire).not.toHaveBeenCalledWith(expect.stringContaining('preset-one'));
      expect(mockRequire).not.toHaveBeenCalledWith(expect.stringContaining('gasket-plugin-one'));

      expect(presetTwo.require).toHaveBeenCalledWith(expect.stringContaining('preset-one'));

      expect(presetOne.require).toHaveBeenCalledWith(expect.stringContaining('@gasket/plugin-one'));
    });

    it('uses default require if not provide by preset', () => {
      loader.loadPreset('gasket-preset-user');
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('gasket-preset-user'));
      expect(mockRequire).toHaveBeenCalledWith(expect.stringContaining('gasket-plugin-user'));
    });

    it('shallow does not loads preset dependencies', () => {
      const results = loader.loadPreset('@gasket/preset-one', {}, { shallow: true });
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
            name: '@gasket/plugin-one',
            module: null,
            from: '@gasket/preset-one'
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
        add: ['@gasket/plugin-one']
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
        presets: ['@gasket/preset-one']
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
        add: ['@gasket/plugin-one']
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
        presets: ['/path/to/node_modules/gasket-preset-user'],
        add: ['/app/plugins/app-plugin-one.js']
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
        presets: ['@gasket/preset-one']
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

    // TODO: test variants
    it('removes configured plugins', () => {
      const config = {
        presets: ['@gasket/preset-one'],
        remove: ['@gasket/one']
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
        presets: ['@gasket/preset-two']
      };
      const results = loader.loadConfigured(config);
      expect(results.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            module: pluginOne,
            from: '@gasket/preset-two'
          })
        ])
      );
    });

    it('dedupes plugins preferring add plugins', () => {
      const config = {
        presets: ['@gasket/preset-two'],
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
