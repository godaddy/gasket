const { initWebpack } = require('@gasket/plugin-webpack');

/**
 * Bring forward configuration from intl plugin to config for next.
 *
 * @param {Gasket} gasket - The gasket API
 * @param {object} config - Configuration to pass to Nextjs
 * @private
 */
function forwardIntlConfig(gasket, config) {
  const { logger } = gasket;
  const { intl: intlConfig = {} } = gasket.config;

  if (intlConfig.nextRouting === false) {
    return;
  }

  // make a copy of i18n for mutating
  const i18n = { ...(config.i18n || {}) };

  if (intlConfig.locales) {
    if (i18n.locales) {
      logger.warn(
        'Gasket config has both `intl.locales` (preferred) and `nextConfig.i18n.locales`'
      );
    }
    i18n.locales = intlConfig.locales;

    if (i18n.defaultLocale) {
      logger.warn(
        'Gasket config has both `intl.defaultLocale` (preferred) and `nextConfig.i18n.defaultLocale`'
      );
    }
    i18n.defaultLocale = intlConfig.defaultLocale;

    config.i18n = i18n;
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

  const config = {
    poweredByHeader: false,
    ...nextConfig
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
