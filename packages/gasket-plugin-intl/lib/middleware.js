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
    /* eslint-disable require-atomic-updates */
    const acceptLanguage = (req.headers['accept-language'] || defaultLocale).split(',')[0];
    const locale = await gasket.execWaterfall('intlLocale', acceptLanguage, req, res);
    const mappedLocale = localesMap && localesMap[locale] || locale;

    /**
     * Gasket data to render as global object for browser access
     *
     * @typedef {LocalesProps} GasketIntlData
     * @property {string} [basePath] - Include base path if configured
     */
    const intlData = {
      locale: mappedLocale
    };
    if (basePath) intlData.basePath = basePath;

    /**
     * Load locale file(s) and return localesProps
     *
     * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
     * @returns {LocalesProps} localesProps
     */
    req.loadLocaleData = (localePathPath = manifest.defaultPath) => {
      return localeUtils.serverLoadData(localePathPath, mappedLocale, localesParentDir);
    };

    /**
     * Load locale data and makes available from gasketData
     *
     * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
     * @returns {LocalesProps} localesProps
     */
    req.withLocaleRequired = (localePathPath = manifest.defaultPath) => {
      const localesProps = req.loadLocaleData(localePathPath);
      merge(intlData, localesProps);
      return localesProps;
    };

    // The gasketData object allows certain config data to be available for
    // rendering as a global object for access in the browser.
    const { gasketData = {} } = res.locals;
    res.locals.gasketData = { ...gasketData, intl: intlData };
    next();
    /* eslint-enable require-atomic-updates */
  };
};
