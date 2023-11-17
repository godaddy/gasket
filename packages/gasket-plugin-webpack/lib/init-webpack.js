/**
 * Sets up a context object with special getters
 *
 * @param {Gasket} gasket - The Gasket API
 * @param {object} context - Additional context-specific information
 * @param {string} name - Plugin name
 * @returns {object} context
 */
function setupContext(gasket, context, name) {
  return {
    ...context,
    // TODO: Remove in next major version
    get webpackMerge() {
      gasket.logger.warning(`DEPRECATED \`context.webpackMerge\` of webpackConfig hook in ${ name } - Use \`require('webpack-merge')\``);
      return require('webpack-merge');
    },
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
export default function initWebpack(gasket, initConfig, context) {
  const WebpackMetricsPlugin = require('./webpack-metrics-plugin');

  const baseConfig = {
    ...initConfig,
    plugins: [
      ...(initConfig && initConfig.plugins ? initConfig.plugins : []),
      new WebpackMetricsPlugin({ gasket })
    ].filter(Boolean)
  };

  // TODO: Remove in next major version
  let mergedConfig = require('./deprecated-merges')(gasket, baseConfig, context);

  // eslint-disable-next-line no-sync
  gasket.execApplySync('webpackConfig', (plugin, handler) => {
    const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycle';
    mergedConfig = handler(mergedConfig, setupContext(gasket, context, name));
  });

  return mergedConfig;
};
