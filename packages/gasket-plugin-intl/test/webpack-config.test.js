const webpack = require('webpack');
const plugin = require('../lib/index');
const { webpackConfig: hook } = plugin.hooks;

describe('webpackConfig', function () {
  let mockGasket, mockConfig;

  beforeEach(function () {
    mockGasket = {
      config: {
        root: '/path/to/root',
        intl: {}
      }
    };

    mockConfig = {};
  });

  it('adds env vars to EnvironmentPlugin', function () {
    const results = hook(mockGasket, mockConfig, { webpack });
    expect(results).toHaveProperty('plugins');
    expect(results.plugins).toHaveLength(1);
    expect(results.plugins[0]).toBeInstanceOf(webpack.EnvironmentPlugin);
    expect(results.plugins[0]).toEqual({
      keys: ['GASKET_INTL_LOCALES_DIR', 'GASKET_INTL_MANIFEST_FILE'],
      defaultValues: {}
    });
  });

  it('merges with existing plugins', function () {
    mockConfig.plugins = [
      new webpack.EntryOptionPlugin(),
      new webpack.DynamicEntryPlugin()
    ];

    const results = hook(mockGasket, mockConfig, { webpack });
    expect(results).toHaveProperty('plugins');
    expect(results.plugins).toHaveLength(3);
    expect(results.plugins[2]).toBeInstanceOf(webpack.EnvironmentPlugin);
    expect(results.plugins[2]).toEqual({
      keys: ['GASKET_INTL_LOCALES_DIR', 'GASKET_INTL_MANIFEST_FILE'],
      defaultValues: {}
    });
  });

  it('merges with existing EnvironmentPlugin', function () {
    mockConfig.plugins = [
      new webpack.EnvironmentPlugin([
        'GASKET_BOGUS'
      ])
    ];

    const results = hook(mockGasket, mockConfig, { webpack });
    expect(results).toHaveProperty('plugins');
    expect(results.plugins).toHaveLength(2);
    expect(results.plugins[1]).toBeInstanceOf(webpack.EnvironmentPlugin);
    expect(results.plugins[1]).toEqual({
      keys: ['GASKET_INTL_LOCALES_DIR', 'GASKET_INTL_MANIFEST_FILE'],
      defaultValues: {}
    });
  });
});
