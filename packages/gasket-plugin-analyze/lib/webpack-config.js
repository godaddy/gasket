/// <reference types="@gasket/plugin-webpack" />

/**
 * Adds the Webpack Bundle Analyzer plugin if the analyze flag is set.
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
export default async function webpackConfigHook(gasket, webpackConfig, context) {
  // eslint-disable-next-line no-process-env
  const { ANALYZE } = process.env;
  const {
    config: {
      env,
      bundleAnalyzerConfig: userConfig = {}
    }
  } = gasket;

  const enabled = env.endsWith('analyze') || (ANALYZE && !['false', '0'].some(v => v === ANALYZE));

  // Only add the analyzer plugin if enabled
  if (enabled) {
    const merge = (await import('deepmerge')).default;
    const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer');
    const defaultConfig = (await import('./default-config.js')).default;

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
}
