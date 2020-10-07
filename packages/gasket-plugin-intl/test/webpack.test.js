const assume = require('assume');
const plugin = require('../lib/index');

const { webpack: webpackHook } = plugin.hooks;

describe('webpack', () => {

  it('adds env vars to EnvironmentPlugin', function () {
    const mockGasket = {
      config: {
        root: '/path/to/root',
        intl: {}
      }
    };

    const results = webpackHook(mockGasket, {});
    assume(results).property('plugins');
    assume(results.plugins[0]).eqls({
      keys: ['GASKET_INTL_LOCALES_DIR', 'GASKET_INTL_MANIFEST_FILE'],
      defaultValues: {}
    });
  });
});
