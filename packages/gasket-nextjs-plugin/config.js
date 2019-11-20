const { initWebpack } = require('@gasket/webpack-plugin');
const path = require('path');

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
  const { config, loader } = gasket;
  const {
    root,
    // prefer clearer property name with fall back
    nextConfig = config.next || {}
  } = config;

  const configFile = loader.tryResolve(path.join(root, 'next.config.js'));
  const configFromFile = configFile && loader.require(configFile) || {};

  const mergedConfig = {
    ...configFromFile,
    ...nextConfig
  };

  if (includeWebpackConfig) {
    //
    // Add webpack property to nextConfig and wrap existing
    //
    mergedConfig.webpack = function webpack(webpackConfig, data) {
      if (typeof configFromFile.webpack === 'function') {
        webpackConfig = configFromFile.webpack(webpackConfig, data);
      }
      if (typeof nextConfig.webpack === 'function') {
        webpackConfig = nextConfig.webpack(webpackConfig, data);
      }
      return initWebpack(gasket, webpackConfig, data);
    };
  }

  mergedConfig.poweredByHeader = false;

  return gasket.execWaterfall('nextConfig', mergedConfig);
}

module.exports = {
  createConfig
};
