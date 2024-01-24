/**
 * Sets up a context object with special getters
 *
 * @param {object} context - Additional context-specific information
 * @returns {object} context
 */
function setupContext(context) {
  return {
    ...context,
    get webpack() {
      return require('webpack');
    }
  };
}

/**
 * Creates the webpack config
 * @param {Gasket} gasket - The Gasket API
 * @param {object} initConfig - Initial webpack config
 * @param {object} context - Additional context-specific information
 * @returns {object} Final webpack config
 */
module.exports = function initWebpack(gasket, initConfig, context) {
  const WebpackMetricsPlugin = require('./webpack-metrics-plugin');

  const baseConfig = {
    ...initConfig,
    plugins: [
      ...(initConfig && initConfig.plugins ? initConfig.plugins : []),
      new WebpackMetricsPlugin({ gasket })
    ].filter(Boolean)
  };

  // eslint-disable-next-line no-sync
  return gasket.execWaterfallSync('webpackConfig', baseConfig, setupContext(context));
};
