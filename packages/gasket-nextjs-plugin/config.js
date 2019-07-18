const { initWebpack } = require('@gasket/webpack-plugin');

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

  let nextConfig;
  if (!includeWebpackConfig) {
    nextConfig = config.next || {};
  } else {
    nextConfig = {
      ...config.next,
      webpack: (webpackConfig, data) => {
        return initWebpack(gasket, webpackConfig, data);
      }
    };
  }

  nextConfig.poweredByHeader = false;

  return gasket.execWaterfall('nextConfig', nextConfig);
}

module.exports = {
  createConfig
};
