const merge = require('deepmerge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/**
 * Gasket Analyzer Plugin
 *
 * @type {{hooks: {webpack}}}
 */
module.exports = {
  name: 'analyze',
  hooks: {
    /**
     * Add the analyzer webpack plugin if analyze flag has been set
     *
     * @param {Object} gasket - Gasket API
     * @param {Object} webpackConfig - Webpack config
     * @param {Object} data - Next.js data
     * @returns {Object} webpackConfig
     */
    webpack(gasket, webpackConfig, data) {
      const {
        config: {
          analyze = false,
          bundleAnalyzerConfig: userConfig = {}
        }
      } = gasket;

      //
      // analyze will be set by the cli
      //
      if (analyze) {
        const { isServer } = data;
        const bundleAnalyzerConfig = merge(require('./default-config'),
          userConfig);
        const { browser = {}, server = {} } = bundleAnalyzerConfig;

        //
        // return webpack config partial
        //
        return {
          plugins: [
            new BundleAnalyzerPlugin({
              ...(isServer ? server : browser)
            })]
        };
      }

      return null;
    },

    /**
     * Add files & extend package.json for new apps.
     *
     * @param {Gasket} gasket - The gasket API.
     * @param {CreateContext} context - Create context
     * @returns {Promise} promise
     * @public
     */
    async create(gasket, context) {
      const { pkg } = context;

      pkg.add('scripts', {
        analyze: 'gasket analyze'
      });
    }
  }
};
