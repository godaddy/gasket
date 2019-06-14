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
});
