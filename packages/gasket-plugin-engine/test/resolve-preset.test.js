const pluginInfo = require('@gasket/resolve/plugin-info');

describe('When resolving preset data structures', () => {

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  const pluginA = {
    hooks: {
      eventA() {
        return Promise.resolve(1);
      }
    }
  };

  const pluginB = {
    hooks: {
      eventA() {
        return 2;
      }
    }
  };

  const presets = {
    strings: ['a', 'b'],
    mixed: [
      'a',
      pluginInfo({
        required: pluginB,
        preset: '@gasket/test-preset',
        shortName: 'b'
      })
    ],
    infos: [
      pluginInfo({
        required: pluginA,
        preset: '@gasket/test-preset',
        shortName: 'a'
      }),
      pluginInfo({
        required: pluginB,
        preset: '@gasket/test-preset',
        shortName: 'b'
      })
    ]
  };

  /**
   * Test helper that configures all require mocks and returns
   * a PluginEngine instance to resolve a preset with the given `shortName`
   * @param   {String} shortName Short name of the gasket preset.
   * @returns {PluginEngine} Instance resolving to `@gasket/${shortName}-preset`
   */
  function engineForPreset(shortName) {
    jest
      .doMock('@gasket/a-plugin', () => pluginA, { virtual: true })
      .doMock('@gasket/b-plugin', () => pluginB, { virtual: true });

    Object.keys(presets).forEach(name => {
      jest.doMock(`@gasket/${name}-preset`, () => presets[name], { virtual: true });
    });

    const PluginEngine = require('../');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });
    return new PluginEngine({
      some: 'config',
      plugins: {
        presets: [shortName]
      }
    });
  }

  it('resolves a preset of [string, string] properly', async () => {
    const engine = engineForPreset('strings');
    const result = await engine.exec('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves a preset of [string, info] properly', async () => {
    const engine = engineForPreset('mixed');
    const result = await engine.exec('eventA');
    expect(result).toEqual([1, 2]);
  });

  it('resolves a preset of [info, info] properly', async () => {
    const engine = engineForPreset('infos');
    const result = await engine.exec('eventA');
    expect(result).toEqual([1, 2]);
  });
});
