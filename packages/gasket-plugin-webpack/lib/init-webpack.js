/// <reference types="@gasket/plugin-log" />

/**
 * Sets up a context object with special getters
 * @type {import('./internal').setupContext}
 */
function setupContext(gasket, context, name) {
  return {
    ...context,
    // TODO: Remove in next major version
    get webpackMerge() {
      gasket.logger.warning(
        `DEPRECATED \`context.webpackMerge\` of webpackConfig hook in ${name} - Use \`require('webpack-merge')\``
      );
      return require('webpack-merge');
    },
    get webpack() {
      return require('webpack');
    }
  };
}

/**
 * Creates the webpack config
 * @type {import('@gasket/plugin-webpack').initWebpack}
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

  // TODO: Remove in next major version
  let mergedConfig = require('./deprecated-merges')(
    gasket,
    baseConfig,
    context
  );

  // eslint-disable-next-line no-sync
  gasket.execApplySync('webpackConfig', (plugin, handler) => {
    const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycle';
    mergedConfig = handler(mergedConfig, setupContext(gasket, context, name));
  });

  return mergedConfig;
};
