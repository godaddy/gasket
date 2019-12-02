const { initWebpack } = require('@gasket/plugin-webpack');

/**
 * Small helper function that creates nextjs configuration from the gasket
 * configuration.
 *
 * @param   {Gasket}  gasket                The gasket API.
 * @param   {Boolean} includeWebpackConfig  `true` to generate webpack config
 * @returns {Promise<Object>} The configuration data for Nextjs
 * @private
 */
function createConfig(gasket, includeWebpackConfig = true) {
  const { config } = gasket;
  // prefer clearer property name with fall back
  const { nextConfig = config.next || {} } = config;

  if (includeWebpackConfig) {
    const { webpack: existingWebpack } = nextConfig;
    //
    // Add webpack property to nextConfig and wrap existing
    //
    nextConfig.webpack = function webpack(webpackConfig, data) {
      if (typeof existingWebpack === 'function') {
        webpackConfig = existingWebpack(webpackConfig, data);
      }
      return initWebpack(gasket, webpackConfig, data);
    };
  }

  nextConfig.poweredByHeader = false;

  return gasket.execWaterfall('nextConfig', nextConfig);
}

module.exports = {
  createConfig
};
