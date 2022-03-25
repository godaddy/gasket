import {
  pluginIdentifier,
  presetIdentifier,
  Loader,
  Resolver,
  PluginInfo,
  PresetInfo,
  ModuleInfo
} from '@gasket/resolve';

describe.only('@gasket/resolve', () => {
  const perform = false;

  describe('pluginIdentifier', function () {
    it('exposes expected member types', function () {
      const id = pluginIdentifier('@gasket/plugin-example');

      const rawName: string = id.rawName;
      const fullName: string = id.fullName;
      const longName: string = id.longName;
      const shortName: string = id.shortName;
      const name: string = id.name;
      const version: string | null = id.version;
      const full: string = id.full;
      const isShort: string = id.isShort;
      const isLong: string = id.isLong;
      const isPrefixed: boolean = id.isPrefixed;
      const hasScope: boolean = id.hasScope;
      const hasProjectScope: boolean = id.hasProjectScope;
      const hasVersion: boolean = id.hasVersion;

      // @ts-ignore-error
      id.bogus;

      const nextId = id.nextFormat();
      nextId && nextId.name;
    });
  });

  describe('presetIdentifier', function () {
    it('exposes expected member types', function () {
      const id = presetIdentifier('@gasket/preset-example');

      const rawName: string = id.rawName;
      const fullName: string = id.fullName;
      const longName: string = id.longName;
      const shortName: string = id.shortName;
      const name: string = id.name;
      const version: string | null = id.version;
      const full: string = id.full;
      const isShort: string = id.isShort;
      const isLong: string = id.isLong;
      const isPrefixed: boolean = id.isPrefixed;
      const hasScope: boolean = id.hasScope;
      const hasProjectScope: boolean = id.hasProjectScope;
      const hasVersion: boolean = id.hasVersion;

      // test invalid member
      // @ts-ignore-error
      id.bogus;

      const nextId = id.nextFormat();
      nextId && nextId.name;
    });
  });

  describe('Loader', function () {
    const loader = new Loader({})

    it('accepts expected arguments ', function () {
      new Loader({require: require, resolveFrom: ['.']})
    });

    describe('expect method signatures', function () {
      it('.loadPlugin', function () {
        if (perform) {
          let result: PluginInfo;
          result = loader.loadPlugin('example')
          result = loader.loadPlugin('example', {extra: true})
        }
      });

      it('.loadPreset', function () {
        if (perform) {
          let result: PresetInfo;
          result = loader.loadPreset('@example/plugin')
          result = loader.loadPreset('@example/plugin', {extra: true})
          result = loader.loadPreset('@example/plugin', {extra: true}, {shallow: true})
          // @ts-ignore-error
          result = loader.loadPreset('@example/plugin', {extra: true}, {bogus: 'bad'})
        }
      });

      it('.loadModule', function () {
        if (perform) {
          let result: ModuleInfo;
          result = loader.loadModule('example')
          result = loader.loadModule('example', {extra: true})
        }
      });

      it('.getModuleInfo', function () {
        if (perform) {
          let result: ModuleInfo;
          result = loader.getModuleInfo({}, 'example')
          result = loader.getModuleInfo({}, 'example', {extra: true})
        }
      });

      it('.loadConfigured', function () {
        if (perform) {
          let result: { presets: PresetInfo[]; plugins: PluginInfo[] };
          result = loader.loadConfigured({
            presets: ['@example/preset'],
            add: ['@example/plugin'],
            remove: ['@example/plugin-2']
          })

          result = loader.loadConfigured({
            presets: ['@example/preset'],
            add: ['@example/plugin']
          })
        }
      });
    });
  });

  describe('Resolver', function () {
    const resolver = new Resolver({})

    it('accepts expected arguments ', function () {
      new Resolver({require: require, resolveFrom: ['.']})
    });

    describe('expect method signatures', function () {
      it('.resolve', function () {
        if (perform) {
          const result: string = resolver.resolve('moduleName');
        }
      })
      it('.require', function () {
        if (perform) {
          const result: object = resolver.require('moduleName');
        }
      })
      it('.tryResolve', function () {
        if (perform) {
          const result: string | null = resolver.tryResolve('moduleName');
        }
      })
      it('.tryRequire', function () {
        if (perform) {
          const result: object | null = resolver.tryRequire('moduleName');
        }
      })
    });
  });
});

