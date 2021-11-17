const path = require('path');
const merge = require('lodash.merge');
const accept = require('@hapi/accept');
const { LocaleUtils } = require('@gasket/helper-intl');
const { getIntlConfig } = require('./configure');


function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * Ensure consistent locale format coming from accept-language header.
 *
 * @example
 * - az-AZ
 * - az-Arab
 * - az-AZ-Latn
 *
 * @param {string} language - Selected accept-language
 * @returns {string} locale
 */
function formatLocale(language) {
  const [lang, ...rest] = language ? language.split('-') : [];
  return [
    lang.toLowerCase(),
    ...rest.map(o => o.length === 2 ? o.toUpperCase() : capitalize(o))
  ].join('-');
}

module.exports = function middlewareHook(gasket) {
  const { defaultLocale, basePath, localesMap, localesDir, manifestFilename, locales } = getIntlConfig(gasket);

  const manifest = require(path.join(localesDir, manifestFilename));
  const localesParentDir = path.dirname(localesDir);
  const localeUtils = new LocaleUtils({ manifest, basePath });

  return async function intlMiddleware(req, res, next) {
    let preferredLocale = defaultLocale;
    if (req.headers['accept-language']) {
      try {
        // Get highest or highest from locales if configured
        preferredLocale = formatLocale(
          accept.language(req.headers['accept-language'], locales)
        );
      } catch (error) {
        gasket.logger.warning(`Unable to parse accept-language header: ${ error.message }`);
      }
    }

    // Allow plugins to determine locale to use
    const pluginLocale = await gasket.execWaterfall('intlLocale', preferredLocale, { req, res });
    // Once we have a locale, see if there has been any remapping for it
    const locale = localesMap && localesMap[pluginLocale] || pluginLocale;

    /**
     * Gasket data to render as global object for browser access
     *
     * @typedef {LocalesProps} GasketIntlData
     * @property {string} [basePath] - Include base path if configured
     */

    /**
     * Get the Intl GasketData from res.locals
     *
     * @returns {GasketIntlData} intlData - Intl gasketData
     */
    function getIntlData() {
      const { gasketData = {} } = res.locals;
      return gasketData.intl || {};
    }

    /**
     * The gasketData object allows certain config data to be available for
     * rendering allowing access in the browser.
     *
     * @param {GasketIntlData} intlData - data to merge to gasketData
     */
    function mergeGasketData(intlData) {
      const { gasketData = {} } = res.locals;
      const intl = merge({}, getIntlData(), intlData);
      res.locals.gasketData = { ...gasketData, intl };
    }

    mergeGasketData({
      locale,
      ...(basePath && { basePath } || {})
    });

    /**
     * Load locale data and makes available from gasketData
     *
     * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
     * @returns {LocalesProps} localesProps
     */
    req.withLocaleRequired = function withLocaleRequired(localePathPart = manifest.defaultPath) {
      const localesProps = localeUtils.serverLoadData(localePathPart, locale, localesParentDir);
      mergeGasketData(localesProps);
      return localesProps;
    };

    /**
     * Select a message for a loaded locale. Fall back to provided default if provided, or
     * message id if a loaded message is not found.
     *
     * @param {string} id - Key of translated message
     * @param {string} [defaultMessage] - Fallback message if no id found or loaded
     * @returns {string} message
     */
    req.selectLocaleMessage = function selectLocaleMessage(id, defaultMessage) {
      const localeProps = getIntlData();
      const messages = localeProps.messages && localeProps.messages[localeProps.locale] || {};
      return messages[id] || defaultMessage || id;
    };

    res.locals.localesDir = localesDir;

    next();
  };
};
