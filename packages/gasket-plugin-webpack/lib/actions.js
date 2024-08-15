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
function getWebpackConfig(gasket, initConfig, context) {
  const WebpackMetricsPlugin = require('./webpack-metrics-plugin');

  const baseConfig = {
    ...initConfig,
    plugins: [
      ...(initConfig && initConfig.plugins ? initConfig.plugins : []),
      new WebpackMetricsPlugin({ gasket })
    ].filter(Boolean)
  };

  baseConfig.resolve ??= {};
  baseConfig.resolve.alias ??= {};
  // @ts-ignore -- ensure webpack does not bundle itself
  baseConfig.resolve.alias.webpack = false;

  // eslint-disable-next-line no-sync
  return gasket.execWaterfallSync('webpackConfig', baseConfig, setupContext(context));
}

module.exports = {
  getWebpackConfig
};
