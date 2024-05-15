/// <reference types="@gasket/plugin-logger" />

/**
 * Sets up a context object with special getters
 * @type {import('./internal').setupContext}
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
 * @type {import('./internal').initWebpack}
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
