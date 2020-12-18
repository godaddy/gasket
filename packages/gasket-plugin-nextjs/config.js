const { initWebpack } = require('@gasket/plugin-webpack');

/**
 * Bring forward configuration from intl plugin to config for next.
 *
 * @param {Gasket} gasket - The gasket API
 * @param {object} config - Configuration to pass to Nextjs
 * @private
 */
function forwardIntlConfig(gasket, config) {
  const { intl: intlConfig = {} } = gasket.config;

  const { logger } = gasket;
  // Carry over defaultLocale and locales from intl config
  if (intlConfig.locales) {
    if (config.i18n.locales) {
      logger.warning('Gasket config has both `intl.locales` (preferred) and `nextConfig.i18n.locales`');
    }
    config.i18n.locales = intlConfig.locales;
  }
  if (intlConfig.defaultLocale) {
    if (config.i18n.locales) {
      logger.warning('Gasket config has both `intl.defaultLocale` (preferred) and `nextConfig.i18n.defaultLocale`');
    }
    config.i18n.defaultLocale = intlConfig.defaultLocale;
  }
}

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
  const { nextConfig = {} } = gasket.config;
  const { i18n = {} } = nextConfig;

  const config = {
    poweredByHeader: false,
    ...nextConfig,
    // make a copy of i18n for mutating
    i18n: { ...i18n }
  };

  forwardIntlConfig(gasket, config);

  if (includeWebpackConfig) {
    const { webpack: existingWebpack } = config;
    //
    // Add webpack property to nextConfig and wrap existing
    //
    config.webpack = function webpack(webpackConfig, data) {
      if (typeof existingWebpack === 'function') {
        webpackConfig = existingWebpack(webpackConfig, data);
      }
      return initWebpack(gasket, webpackConfig, data);
    };
  }

  return gasket.execWaterfall('nextConfig', config);
}

module.exports = {
  createConfig
};
