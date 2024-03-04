/// <reference types="@gasket/plugin-nextjs" />

/** @type {import('@gasket/engine').HookHandler<'webpackConfig'>} */
module.exports = function webpackConfigHook(gasket, webpackConfig, context) {
  const {
    command,
    config: { bundleAnalyzerConfig: userConfig = {} }
  } = gasket;

  // Only analyze add analyzer plugin for the analyze command
  if (command.id === 'analyze') {
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
