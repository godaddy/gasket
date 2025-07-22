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

/** @type {import('@gasket/core').ActionHandler<'getWebpackConfig'>} */
function getWebpackConfig(gasket, initConfig, context) {
  const WebpackMetricsPlugin = require('./webpack-metrics-plugin');
  const GasketEnvGuardPlugin = require('./gasket-env-guard-plugin');

  /** @type {import('webpack').Configuration} */
  const baseConfig = {
    ...initConfig,
    plugins: [
      ...(initConfig && initConfig.plugins ? initConfig.plugins : []),
      new WebpackMetricsPlugin({ gasket }),
      new GasketEnvGuardPlugin()
    ].filter(Boolean)
  };

  baseConfig.resolve ??= {};
  baseConfig.resolve.alias ??= {};


  const alias = /** @type {Record<string, string | false>} */ (baseConfig.resolve.alias);
  alias.webpack = false;
  baseConfig.resolve.alias = alias;

  return gasket.execWaterfallSync('webpackConfig', baseConfig, setupContext(context));
}

module.exports = {
  getWebpackConfig
};
