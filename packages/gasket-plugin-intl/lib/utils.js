function getIntlConfig(gasket) {
  const { intl: intlConfig = {} } = gasket.config || {};
  return intlConfig;
}

/**
 * The locale codes will fall back in this sequence
 * (da-DK/da used as an example locale)
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {string} locale - current locale.
 * @returns {string} locale - fallback locale to use.
 */
function getFallbackLocale(locale = '') {
  if (locale.indexOf('-') > 0) {
    return locale.split('-')[0];
  }

  if (locale !== 'en') {
    return 'en-US';
  }

  return null;
}

/**
 * Get the mapped locale code based on mapping from gasket.config.
 * Returns mapped locale if a mapping exists, otherwise returns original.
 *
 * @param {Gasket} gasket - Gasket config
 * @param {string} locale - locale
 * @returns {string} mapped locale
 */
function getMappedLocale(gasket, locale) {
  const { localeMap } = getIntlConfig(gasket);
  if (locale in localeMap && localeMap[locale]) {
    return localeMap[locale];
  }
  return locale;
}

function getAvailableLocales(localesManifest) {
  const locales = new Set();

  const getLocales = obj => Object.entries(obj).
    forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (key !== '__default__') {
          locales.add(key);
        }
      } else if (value) {
        getLocales(value);
      }
    });

  getLocales(localesManifest);

  return locales;
}

/**
 * Creates a getLocale from gasket config to handle mapping,
 * and fallback complexities.
 *
 * @param {Gasket} gasket - Gasket
 * @returns {getLocale} getLocale
 */
function createGetLocale(gasket) {
  const { defaultLocale, outputDir } = getIntlConfig(gasket);
  const localesManifest = loadLocalesManifest(outputDir);
  const availablelocales = getAvailableLocales(localesManifest);
  /**
   * Derive the locale from request headers and use mapping and fallback to
   * get the an appropriate supported locale
   *
   * @typedef {Function} getLocale
   *
   * @param {Request} req - Request object
   * @returns {string} lang
   */
  return function getLocale(req) {
    const { store } = req;
    const locale = store.getState().intl.locale;

    let mappedlocale = locale;
    while (mappedlocale !== null) {
      mappedlocale = getMappedLocale(gasket, mappedlocale);
      if (availablelocales.has(mappedlocale)) {
        return mappedlocale;
      }
      mappedlocale = getFallbackLocale(mappedlocale);
    }

    return defaultLocale;
  };
}

module.exports = {
  getIntlConfig,
  getAvailableLocales,
  createGetLocale
};
