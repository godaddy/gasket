const resolvePlugins = require('../plugins');

describe('resolvePlugins', () => {

  it('should resolve all plugins correctly', () => {
    const mockA = {};
    const mockB = {};

    const preset = {
      name: '@gasket/some-preset',
      dependencies: {
        '@gasket/testa-plugin': '^1.0.0',
        '@gasket/testb-plugin': '^2.0.0'
      }
    };

    jest
      .doMock(`${__dirname}/package.json`, () => preset, { virtual: true })
      .doMock('@gasket/testa-plugin', () => mockA, { virtual: true })
      .doMock('@gasket/testb-plugin', () => mockB, { virtual: true });

    const [resolveA, resolveB] = resolvePlugins({ dirname: __dirname });

    expect(resolveA.required).toBe(mockA);
    expect(resolveA.shortName).toBe('testa');
    expect(resolveA.name).toBe('@gasket/testa-plugin');
    expect(resolveA.range).toBe('^1.0.0');
    expect(resolveA.from).toBe('@gasket/some-preset');

    expect(resolveB.required).toBe(mockB);
    expect(resolveB.shortName).toBe('testb');
    expect(resolveB.name).toBe('@gasket/testb-plugin');
    expect(resolveB.range).toBe('^2.0.0');
    expect(resolveB.from).toBe('@gasket/some-preset');

  });

  it('can properly resolve plugins from extended presets', () => {
    const mockPreset = [{
      required: {},
      from: '@gasket/snl-preset',
      shortName: 'television',
      name: '@gasket/television-plugin',
      range: '^1.0.0',
      config: {}
    }, {
      required: {},
      from: '@gasket/snl-preset',
      shortName: 'comedy',
      name: '@gasket/comedy-plugin',
      range: '^1.0.0',
      config: {}
    }];

    const preset = {
      name: '@gasket/late-night-sketch-preset',
      dependencies: {
        '@gasket/snl-preset': '^1.0.0'
      }
    };

    jest
      .doMock('😹🤪🗽/package.json', () => preset, { virtual: true })
      .doMock('@gasket/snl-preset', () => mockPreset, { virtual: true });

    const plugins = resolvePlugins({
      dirname: '😹🤪🗽',
      resolve: require,
      extends: [
        '@gasket/snl-preset'
      ]
    });

    const [tv, comedy] = plugins;

    expect(tv.shortName).toBe('television');
    expect(tv.name).toBe('@gasket/television-plugin');
    expect(tv.range).toBe('^1.0.0');
    expect(tv.from).toBe('@gasket/snl-preset');

    expect(comedy.shortName).toBe('comedy');
    expect(comedy.name).toBe('@gasket/comedy-plugin');
    expect(comedy.range).toBe('^1.0.0');
    expect(comedy.from).toBe('@gasket/snl-preset');
  });

  it('properly resolves extended presets with overlapping semver ranges', () => {
    const mockPreset = [{
      required: {},
      from: '@gasket/first-season-preset',
      shortName: 'episode',
      name: '@gasket/episode-plugin',
      range: '^1.1.1',
      config: {}
    }, {
      required: {},
      from: '@gasket/recent-season-preset',
      shortName: 'episode',
      name: '@gasket/episode-plugin',
      range: '^1.44.21',
      config: {}
    }];

    const preset = {
      name: '@gasket/snl-preset',
      dependencies: {
        '@gasket/episode-preset': '^1.0.0'
      }
    };

    jest
      .doMock('snl/package.json', () => preset, { virtual: true })
      .doMock('@gasket/episode-preset', () => mockPreset, { virtual: true });

    const plugins = resolvePlugins({
      dirname: 'snl',
      resolve: require,
      extends: [
        '@gasket/episode-preset'
      ]
    });

    expect(plugins).toHaveLength(1);
    const [plugin] = plugins;
    expect(plugin.shortName).toBe('episode');
    expect(plugin.name).toBe('@gasket/episode-plugin');
    expect(plugin.range).toBe('^1.1.1');
    expect(plugin.from).toBe('@gasket/first-season-preset');
  });

  it('throws an error if plugins have conflicting semver ranges', () => {
    const mockPreset = [{
      required: {},
      from: '@gasket/tla-preset',
      shortName: 'episode',
      name: '@gasket/episode-plugin',
      range: '^1.3.21',
      config: {}
    }, {
      required: {},
      from: '@gasket/tlok-preset',
      shortName: 'episode',
      name: '@gasket/episode-plugin',
      range: '^2.4.13',
      config: {}
    }];

    const preset = {
      name: '@gasket/avatar-preset',
      dependencies: {
        '@gasket/📺-preset': '^1.0.0'
      }
    };

    jest
      .doMock('🌊🌎🔥🌪/package.json', () => preset, { virtual: true })
      .doMock('@gasket/📺-preset', () => mockPreset, { virtual: true });

    let error = false;
    try {
      resolvePlugins({
        dirname: '🌊🌎🔥🌪',
        resolve: require,
        extends: [
          '@gasket/📺-preset'
        ]
      });
    } catch (err) {
      error = err.message;
    }

    // eslint-disable-next-line max-len
    expect(error).toBe('@gasket/tlok-preset uses @gasket/episode-plugin@^2.4.13, which is currently depended upon by @gasket/episode-plugin@^1.3.21');
  });
});
