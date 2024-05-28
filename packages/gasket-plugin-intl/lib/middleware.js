/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

const path = require('path');
const merge = require('lodash.merge');
const accept = require('@hapi/accept');
const { LocaleUtils } = require('@gasket/helper-intl');
const { getIntlConfig } = require('./configure');

const debug = require('debug')('gasket:plugin:intl:middleware');

/**
 * Capitalize the first letter of a string.
 * @param {string} str - String to capitalize
 * @returns {string} capitalized string
 */
function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * Get the preferred locale from the request headers.
 * @type {import('./internal').getPreferredLocale}
 */
function getPreferredLocale(gasket, req, locales, defaultLocale) {
  let preferredLocale = defaultLocale;
  /** @type {string} */
  const acceptLanguage = req.headers['accept-language'];

  if (acceptLanguage) {
    debug(`Received accept-language of ${acceptLanguage}`);
    try {
      // Get highest or highest from locales if configured
      preferredLocale = formatLocale(accept.language(acceptLanguage, locales));
      debug(`Using ${preferredLocale} as starting locale`);
    } catch (error) {
      gasket.logger.debug(
        `Unable to parse accept-language header: ${error.message}`
      );
    }
  } else {
    debug(
      `No accept-language header; starting with default ${preferredLocale}`
    );
  }

  return preferredLocale;
}

/**
 * Ensure consistent locale format coming from accept-language header.
 * @example
 * - az-AZ
 * - az-Arab
 * - az-AZ-Latn
 * @type {import('./internal').formatLocale}
 */
function formatLocale(language) {
  const [lang, ...rest] = language ? language.split('-') : [];
  return [
    lang.toLowerCase(),
    ...rest.map((o) => (o.length === 2 ? o.toUpperCase() : capitalize(o)))
  ].join('-');
}

/** @type {import('@gasket/core').HookHandler<'middleware'>} */
function middlewareHook(gasket) {
  const {
    defaultLocale,
    basePath,
    localesMap,
    localesDir,
    manifestFilename,
    locales,
    preloadLocales
  } = getIntlConfig(gasket);

  const manifest = require(path.join(localesDir, manifestFilename));
  const localesParentDir = path.dirname(localesDir);
  const localeUtils = new LocaleUtils({
    manifest,
    basePath,
    debug: require('debug')('gasket:helper:intl')
  });

  if (preloadLocales) {
    debug(`Preloading locale files from ${localesParentDir}`);
    Object.keys(manifest.paths).forEach((localePath) => {
      debug(`Preloading locale file ${localePath}`);
      require(path.join(localesParentDir, localePath));
    });
  }

  return async function intlMiddleware(req, res, next) {
    const preferredLocale = getPreferredLocale(
      gasket,
      req,
      locales,
      defaultLocale
    );

    // Allow plugins to determine locale to use
    const pluginLocale = await gasket.execWaterfall(
      'intlLocale',
      preferredLocale,
      { req, res }
    );
    debug(`Locale after plugin updates: ${pluginLocale}`);

    // Once we have a locale, see if there has been any remapping for it
    const locale = (localesMap && localesMap[pluginLocale]) || pluginLocale;
    debug(`Locale after remapping: ${locale}`);

    /**
     * Get the Intl GasketData from res.locals
     * @returns {import('./index').GasketDataIntl} intlData - Intl gasketData
     */
    function getIntlData() {
      const { gasketData = {} } = res.locals;
      return gasketData.intl || {};
    }

    /**
     * The gasketData object allows certain config data to be available for
     * rendering allowing access in the browser.
     * @param {import('./index').GasketDataIntl} intlData - data to merge to gasketData
     */
    function mergeGasketData(intlData) {
      const { gasketData = {} } = res.locals;
      const intl = merge({}, getIntlData(), intlData);
      res.locals.gasketData = { ...gasketData, intl };
    }

    mergeGasketData({
      locale,
      ...((basePath && { basePath }) || {})
    });

    /**
     * Load locale data and makes available from gasketData
     * @type {import('./internal').withLocaleRequired}
     */
    req.withLocaleRequired = function withLocaleRequired(
      localePathPart = manifest.defaultPath
    ) {
      const localesProps = localeUtils.serverLoadData(
        localePathPart,
        locale,
        localesParentDir
      );
      mergeGasketData(localesProps);
      return localesProps;
    };

    /**
     * Select a message for a loaded locale. Fall back to provided default if provided, or
     * message id if a loaded message is not found.
     * @param {string} id - Key of translated message
     * @param {string} [defaultMessage] - Fallback message if no id found or loaded
     * @returns {string} message
     */
    req.selectLocaleMessage = function selectLocaleMessage(id, defaultMessage) {
      const localeProps = getIntlData();
      const messages =
        (localeProps.messages && localeProps.messages[localeProps.locale]) ||
        {};
      return messages[id] || defaultMessage || id;
    };

    res.locals.localesDir = localesDir;

    next();
  };
}

module.exports = {
  timing: {
    before: ['@gasket/plugin-elastic-apm']
  },
  handler: middlewareHook
};
