/* eslint-disable no-sync */

const Engine = require('@gasket/plugin-engine');
const { stub } = require('sinon');
const assume = require('assume');
const { createConfig } = require('../config');

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

  it('adds webpack hook', async () => {
    result = await createConfig(gasket);
    assume(result).has.property('webpack');
    assume(result.webpack).is.a('function');
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
      assume(gasket.execSync).to.be.calledWith('webpack', result, data);
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

      it('excludes SSR only modules', () => {
        result = config.webpack(webpackConfig, data);
        assume(result).to.have.property('node');
        assume(result.node).to.have.property('fs', 'empty');
        assume(result.node).to.have.property('net', 'empty');
        assume(result.node).to.have.property('tls', 'empty');
      });

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
    exec: stub().resolves({}),
    execSync: stub().returns([]),
    config: {
      webpack: {},  // user specified webpack config
      next: {}      // user specified next.js config
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

  return new Engine({
    plugins: {
      add: [require('../index'), require('@gasket/webpack-plugin'), ...plugins].filter(Boolean)
    },
    next: {},
    http: {
      port: 8111
    },

    ...config
  });
}
