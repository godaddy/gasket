import {
  pluginIdentifier,
  presetIdentifier,
  Loader,
  Resolver,
  PluginInfo,
  PresetInfo,
  ModuleInfo,
  loadGasketConfigFile,
  flattenPresets, assignPresetConfig
} from '@gasket/resolve';
import { Gasket, GasketConfigFile } from '@gasket/engine';

describe('@gasket/resolve', () => {
  const perform = false;

  describe('pluginIdentifier', function () {
    // eslint-disable-next-line max-statements
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

      // @ts-expect-error
      id.bogus;

      const nextId = id.nextFormat();
      nextId && nextId.name;
    });
  });

  describe('presetIdentifier', function () {
    // eslint-disable-next-line max-statements
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
      // @ts-expect-error
      id.bogus;

      const nextId = id.nextFormat();
      nextId && nextId.name;
    });
  });

  describe('Loader', function () {
    const loader = new Loader({});

    it('accepts expected arguments', function () {
      const result = new Loader({ require: require, resolveFrom: ['.'] });
    });

    describe('expect method signatures', function () {
      it('.loadPlugin', function () {
        if (perform) {
          let result: PluginInfo;
          result = loader.loadPlugin('example');
          result = loader.loadPlugin('example', { extra: true });
        }
      });

      it('.loadPreset', function () {
        if (perform) {
          let result: PresetInfo;
          result = loader.loadPreset('@example/plugin');
          result = loader.loadPreset('@example/plugin', { extra: true });
          result = loader.loadPreset('@example/plugin', { extra: true }, { shallow: true });
          // @ts-expect-error
          result = loader.loadPreset('@example/plugin', { extra: true }, { bogus: 'bad' });
        }
      });

      it('.loadModule', function () {
        if (perform) {
          let result: ModuleInfo;
          result = loader.loadModule('example');
          result = loader.loadModule('example', { extra: true });
        }
      });

      it('.getModuleInfo', function () {
        if (perform) {
          let result: ModuleInfo;
          result = loader.getModuleInfo({}, 'example');
          result = loader.getModuleInfo({}, 'example', { extra: true });
        }
      });

      it('.loadConfigured', function () {
        if (perform) {
          let result: { presets: PresetInfo[]; plugins: PluginInfo[] };
          result = loader.loadConfigured({
            presets: ['@example/preset'],
            add: ['@example/plugin'],
            remove: ['@example/plugin-2']
          });

          result = loader.loadConfigured({
            presets: ['@example/preset'],
            add: ['@example/plugin']
          });
        }
      });
    });
  });

  describe('Resolver', function () {
    const resolver = new Resolver({});

    it('accepts expected arguments', function () {
      const result = new Resolver({ require: require, resolveFrom: ['.'] });
    });

    describe('expect method signatures', function () {
      it('.resolve', function () {
        if (perform) {
          const result: string = resolver.resolve('moduleName');
        }
      });
      it('.require', function () {
        if (perform) {
          const result: object = resolver.require('moduleName');
        }
      });
      it('.tryResolve', function () {
        if (perform) {
          const result: string | null = resolver.tryResolve('moduleName');
        }
      });
      it('.tryRequire', function () {
        if (perform) {
          const result: object | null = resolver.tryRequire('moduleName');
        }
      });
    });
  });

  describe('loadGasketConfigFile', function () {
    it('has expected signature', function () {
      const config: Promise<GasketConfigFile> = loadGasketConfigFile('.', 'dev', 'build', 'gasket.config');
    });
  });

  describe('assignPresetConfig', function () {
    it('has expected signature', function () {
      if (perform) {
        // @ts-ignore
        const gasket: Gasket = {};

        const results: Gasket = assignPresetConfig(gasket);
      }
    });
  });

  describe('flattenPresets', function () {
    it('has expected signature', function () {
      const flatten: PresetInfo[] = flattenPresets([
        { name: 'one', module: {}, plugins: [], presets: [] },
        {
          name: 'two', module: {}, plugins: [], presets: [
            { name: 'two-a', module: {}, plugins: [], presets: [] },
            {
              name: 'two-b', module: {}, plugins: [], presets: [
                { name: 'two-b-1', module: {}, plugins: [], presets: [] },
                { name: 'two-b-2', module: {}, plugins: [], presets: [] }
              ]
            }
          ]
        }
      ]);
    });
  });
});

