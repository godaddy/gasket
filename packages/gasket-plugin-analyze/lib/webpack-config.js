/// <reference types="@gasket/plugin-webpack" />

/**
 * Adds the Webpack Bundle Analyzer plugin if the analyze flag is set.
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
module.exports = function webpackConfigHook(gasket, webpackConfig, context) {
  const {
    config: { bundleAnalyzerConfig: userConfig = {} }
  } = gasket;

  // Only add the analyzer plugin if ANALYZE flag is true
  if (process.env.ANALYZE === 'true') {
    const merge = require('deepmerge');
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    const defaultConfig = require('./default-config');

    const { isServer } = context;
    const bundleAnalyzerConfig = merge(defaultConfig, userConfig);
    const analyzerOptions = isServer
      ? bundleAnalyzerConfig.server
      : bundleAnalyzerConfig.browser;

    // return webpack config partial
    return {
      ...webpackConfig,
      plugins: [
        ...(webpackConfig.plugins || []),
        new BundleAnalyzerPlugin(analyzerOptions)
      ]
    };
  }

  return webpackConfig;
};
