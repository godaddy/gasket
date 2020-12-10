const path = require('path');
const merge = require('lodash.merge');
const { LocaleUtils } = require('@gasket/helper-intl');
const { getIntlConfig } = require('./configure');

module.exports = function middlewareHook(gasket) {
  const { defaultLocale, basePath, localesMap, localesDir, manifestFilename } = getIntlConfig(gasket);

  const manifest = require(path.join(localesDir, manifestFilename));
  const localesParentDir = path.dirname(localesDir);
  const localeUtils = new LocaleUtils({ manifest, basePath });

  return async function intlMiddleware(req, res, next) {
    const acceptLanguage = (req.headers['accept-language'] || defaultLocale).split(',')[0];
    const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req, res);
    const mappedLocale = localesMap && localesMap[locale] || locale;

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
      locale: mappedLocale,
      ...(basePath && { basePath } || {})
    });

    /**
     * Load locale data and makes available from gasketData
     *
     * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
     * @returns {LocalesProps} localesProps
     */
    req.withLocaleRequired = function withLocaleRequired(localePathPath = manifest.defaultPath) {
      const localesProps = localeUtils.serverLoadData(localePathPath, mappedLocale, localesParentDir);
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

    next();
  };
};
