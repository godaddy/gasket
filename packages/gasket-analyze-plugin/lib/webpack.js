/**
 * Add the analyzer webpack plugin if analyze flag has been set
 *
 * @param {Object} gasket - Gasket API
 * @param {Object} gasket.command - Invoked command details
 * @param {Object} webpackConfig - Webpack config
 * @param {Object} data - Next.js data
 * @returns {Object} webpackConfig
 */
module.exports = function webpack(gasket, webpackConfig, data) {
  const {
    command,
    config: {
      bundleAnalyzerConfig: userConfig = {}
    }
  } = gasket;

  //
  // Only analyze add analyzer plugin for the analyze command
  //
  if (command.id === 'analyze') {
    const merge = require('deepmerge');
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

    const { isServer } = data;
    const bundleAnalyzerConfig = merge(require('./default-config'), userConfig);
    const { browser, server } = bundleAnalyzerConfig;

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
};
