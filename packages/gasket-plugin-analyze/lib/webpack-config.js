/// <reference types="@gasket/plugin-webpack" />

/**
 * Add the analyzer webpack plugin if analyze flag has been set
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
module.exports = function webpackConfigHook(gasket, webpackConfig, context) {
  const {
    config: { bundleAnalyzerConfig: userConfig = {} }
  } = gasket;

  // Only analyze add analyzer plugin for the analyze script
  if (process.env.ANALYZE === 'true') {
    const merge = require('deepmerge');
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

    const { isServer } = context;
    const bundleAnalyzerConfig = merge(require('./default-config'), userConfig);
    const { browser, server } = bundleAnalyzerConfig;

    // return webpack config partial
    return {
      ...webpackConfig,
      plugins: [
        ...(webpackConfig.plugins || []),
        new BundleAnalyzerPlugin({
          ...(isServer ? server : browser)
        })
      ]
    };
  }

  return webpackConfig;
};
