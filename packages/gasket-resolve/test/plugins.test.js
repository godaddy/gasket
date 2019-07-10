const resolvePlugins = require('../plugins');

describe('resolvePlugins', () => {

  it('should resolve all plugins correctly', () => {
    const mockA = {};
    const mockB = {};

    const preset = {
      name: '@gasket/some-preset',
      dependencies: {
        '@gasket/a-plugin': '^1.0.0',
        '@gasket/b-plugin': '^2.0.0'
      }
    };

    jest
      .doMock(`${__dirname}/package.json`, () => preset, { virtual: true })
      .doMock('@gasket/a-plugin', () => mockA, { virtual: true })
      .doMock('@gasket/b-plugin', () => mockB, { virtual: true });

    const [resolveA, resolveB] = resolvePlugins({ dirname: __dirname });

    expect(resolveA.required).toBe(mockA);
    expect(resolveA.shortName).toBe('a');
    expect(resolveA.name).toBe('@gasket/a-plugin');
    expect(resolveA.range).toBe('^1.0.0');
    expect(resolveA.from).toBe('@gasket/some-preset');

    expect(resolveB.required).toBe(mockB);
    expect(resolveB.shortName).toBe('b');
    expect(resolveB.name).toBe('@gasket/b-plugin');
    expect(resolveB.range).toBe('^2.0.0');
    expect(resolveB.from).toBe('@gasket/some-preset');
  });

  it('can properly resolve plugins from extended presets', () => {
    const mockPreset = [{
      required: {},
      from: '@gasket/snl-preset',
      shortName: 'television',
      name: '@gasket/television-preset',
      range: '^1.0.0',
      config: {},
    }, {
      required: {},
      from: '@gasket/snl-preset',
      shortName: 'comedy',
      name: '@gasket/comedy-preset',
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
      .doMock(`${__dirname}/package.json`, () => preset, { virtual: true })
      .doMock('@gasket/snl-preset', () => mockPreset, { virtual: true });

    const plugins = resolvePlugins({
      dirname: __dirname,
      resolve: require,
      extending: [
        '@gasket/snl-preset'
      ]
    });

    console.log(plugins);
  })
});
