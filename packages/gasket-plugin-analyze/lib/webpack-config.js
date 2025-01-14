/// <reference types="@gasket/plugin-webpack" />

/**
 * Adds the Webpack Bundle Analyzer plugin if the analyze flag is set.
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
module.exports = function webpackConfigHook(gasket, webpackConfig, context) {
  const {
    config: { bundleAnalyzerConfig: userConfig = {} }
  } = gasket;

  if (process.env.ANALYZE === 'true') {
    console.warn("Deprecation Warning: Using 'true' for the ANALYZE environment variable is deprecated. Please use '1' instead.");
  }

  // Only add the analyzer plugin if ANALYZE flag is true
  if (process.env.ANALYZE === 'true' || process.env.ANALYZE === '1') {
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
