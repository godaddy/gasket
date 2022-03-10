/* eslint-disable no-sync */

const Engine = require('@gasket/engine');
const { stub } = require('sinon');
const assume = require('assume');
const { createConfig } = require('../lib/config');

const baseWebpackConfig = {
  plugins: [],
  module: {
    rules: []
  },
  optimization: {
    splitChunks: {
      cacheGroups: {}
    },
    minimize: false
  }
};

describe('createConfig', () => {
  let result, gasket, data;

  beforeEach(() => {
    gasket = mockGasketApi();

    data = {
      defaultLoaders: {}
    };
  });

  it('executes the `nextConfig` lifecycle', async function () {
    result = await createConfig(gasket);
    assume(gasket.execWaterfall).has.been.calledWith('nextConfig');
  });

  it('return config object for next.js', async () => {
    result = await createConfig(gasket);
    assume(result).is.an('object');
  });

  it('disables x-powered-by header', async () => {
    result = await createConfig(gasket);
    assume(result).has.property('poweredByHeader', false);
  });

  it('includes `nextConfig` from gasket.config', async () => {
    gasket.config.nextConfig = {
      customConfig: true
    };
    result = await createConfig(gasket);
    assume(result).has.property('customConfig', true);
  });

  it('includes `nextConfig` from gasket.config', async () => {
    gasket.config.nextConfig = {
      customConfig: true
    };
    result = await createConfig(gasket);
    assume(result).has.property('customConfig', true);
  });

  it('intl config options forwarded', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    result = await createConfig(gasket);
    assume(result.i18n).eqls({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    });
  });

  it('intl config only forwarded if locales set', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR'
    };
    result = await createConfig(gasket);
    assume(result.i18n).not.exist();
  });

  it('intl config not forwarded if `intl.nextRouting` disabled', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      nextRouting: false
    };
    result = await createConfig(gasket);
    assume(result.i18n).not.exist();
  });

  it('intl config options merge with existing', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    gasket.config.nextConfig = {
      i18n: {
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en-US'
          }
        ]
      }
    };
    result = await createConfig(gasket);
    assume(result.i18n).eqls({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      domains: [
        {
          domain: 'example.com',
          defaultLocale: 'en-US'
        }
      ]
    });
  });

  it('intl config replaces and warns nextConfig values', async () => {
    gasket.config.intl = {
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US']
    };
    gasket.config.nextConfig = {
      i18n: {
        defaultLocale: 'fake',
        locales: ['fr-FR', 'en-US', 'bogus'],
        domains: [
          {
            domain: 'example.com',
            defaultLocale: 'en-US'
          }
        ]
      }
    };
    result = await createConfig(gasket);
    assume(result.i18n).eqls({
      defaultLocale: 'fr-FR',
      locales: ['fr-FR', 'en-US'],
      domains: [
        {
          domain: 'example.com',
          defaultLocale: 'en-US'
        }
      ]
    });

    assume(gasket.logger.warning).is.called(2);
    assume(gasket.logger.warning).is.calledWithMatch('nextConfig.i18n.defaultLocale');
    assume(gasket.logger.warning).is.calledWithMatch('nextConfig.i18n.locales');
  });

  it('adds webpack hook', async () => {
    result = await createConfig(gasket);
    assume(result).has.property('webpack');
    assume(result.webpack).is.a('function');
  });

  it('wraps existing nextConfig webpack hook', async () => {
    const webpackStub = stub();
    gasket.config.nextConfig = {
      webpack: webpackStub
    };
    result = await createConfig(gasket);
    assume(result).has.property('webpack');
    result.webpack();
    assume(webpackStub).is.called();
  });

  describe('#config.webpack', () => {
    let config, webpackConfig;
    beforeEach(async function () {
      // For some reason proxyquire is taking more than 2 seconds but not always.
      this.timeout(4000);
      webpackConfig = { ...baseWebpackConfig };
      config = await createConfig(gasket);
    });

    it('executes webpack plugin hook', () => {
      result = config.webpack(webpackConfig, data);
      // TODO: should not test this deep into webpack plugin
      assume(gasket.execApplySync).to.be.calledWith('webpack');
    });

    it('returns webpack config object', () => {
      result = config.webpack(webpackConfig, data);
      assume(result).is.an('object');
      assume(result).has.property('plugins');
      assume(result).has.property('module');
    });

    it('merges webpackConfig', () => {
      webpackConfig.bogus = 'BOGUS';
      result = config.webpack(webpackConfig, data);
      assume(result).has.property('bogus', 'BOGUS');
    });

    it('merges the return values from `webpack` into a single webpack config', async function () {
      const engine = lifecycle({}, {
        webpack: function (gasketAPI) {
          assume(gasketAPI).equals(engine);

          return {
            resolve: {
              alias: {
                '@gasket/example': __filename
              }
            }
          };
        }
      }, {
        webpack: function (gasketAPI) {
          assume(gasketAPI).equals(engine);

          return {
            resolve: {
              alias: {
                '@gasket/what': '@gasket/example'
              }
            }
          };
        }
      });

      const nextConfig = await createConfig(engine);
      const resultConfig = nextConfig.webpack({
        plugins: [],
        output: {},
        module: {
          rules: []
        },
        optimization: {
          splitChunks: {
            cacheGroups: {}
          },
          minimize: false
        }
      }, { isServer: false, defaultLoaders: {}, dev: true, config: nextConfig });

      assume(resultConfig.resolve.alias['@gasket/example']).equals(__filename);
      assume(resultConfig.resolve.alias['@gasket/what']).equals('@gasket/example');
    });

    describe('built-ins', () => {

      it('configures SASS loader', () => {
        result = config.webpack(webpackConfig, data);

        assume(result.module.rules.some(rule => rule.test.test('bogus.scss')));
        assume(result.module.rules.some(rule => rule.test.test('bogus.sass')));
      });
    });
  });
});

function mockGasketApi() {
  return {
    execWaterfall: stub().returnsArg(1),
    execWaterfallSync: stub().returnsArg(1),
    exec: stub().resolves({}),
    execSync: stub().returns([]),
    execApplySync: stub().returns([]),
    logger: {
      warning: stub()
    },
    config: {
      root: '/path/to/app',
      webpack: {}  // user specified webpack config
    },
    next: {}
  };
}

/**
 * Helper function to easily add plugins to a plugin engine instance
 * so we can test the execution of lifecycle events.
 *
 * @param {Object} config Configuration for the plugin engine.
 * @param {Array} plugins The plugins that need to be added.
 * @returns {PluginEngine} The plugin Engine.
 * @private
 */
function lifecycle(config = {}, ...plugins) {
  plugins = plugins.map(function (hooks, i) {
    if (hooks.hooks) return hooks;

    return {
      name: `test-${i}`,
      hooks
    };
  });

  const engine = new Engine({
    root: '/path/to/app',
    plugins: {
      add: [require('../lib/index'), require('@gasket/plugin-webpack'), ...plugins].filter(Boolean)
    },
    nextConfig: {},
    http: {
      port: 8111
    },

    ...config
  });

  engine.logger = {
    warning: stub()
  };

  return engine;
}
