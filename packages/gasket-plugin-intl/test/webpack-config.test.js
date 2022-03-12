const assume = require('assume');
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
    assume(results).property('plugins');
    assume(results.plugins).length(1);
    assume(results.plugins[0]).instanceof(webpack.EnvironmentPlugin);
    assume(results.plugins[0]).eqls({
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
    assume(results).property('plugins');
    assume(results.plugins).length(3);
    assume(results.plugins[2]).instanceof(webpack.EnvironmentPlugin);
    assume(results.plugins[2]).eqls({
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
    assume(results).property('plugins');
    assume(results.plugins).length(2);
    assume(results.plugins[1]).instanceof(webpack.EnvironmentPlugin);
    assume(results.plugins[1]).eqls({
      keys: ['GASKET_INTL_LOCALES_DIR', 'GASKET_INTL_MANIFEST_FILE'],
      defaultValues: {}
    });
  });
});
