/**
 * NOTICE! These are common utilities used by packages in browser and node.
 * Do not rely on req, or window.
 */

/**
 * @typedef {import('./index').LocaleManifest} LocaleManifest
 * @typedef {import('./index').LocalePathThunk} LocalePathThunk
 * @typedef {import('./index').LocalePathPartOrThunk} LocalePathPartOrThunk
 * @typedef {import('./index').Lang} Lang
 * @typedef {import('./index').LocalesState} LocalesState
 * @typedef {import('./index').LocalePath} LocalePath
 * @typedef {import('./index').LocalePathPart} LocalePathPart
 * @typedef {import('./index').Locale} Locale
 * @typedef {import('./index').LocalesProps} LocalesProps
 * @typedef {import('./index').LocaleStatus} LocaleStatus
 */

/**
 *Enum for local status values
 * @enum {LocaleStatus}
 */
const LocaleStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

const reLocalePathParam = /(\/[$:{]locale}?\/)/;
const reLeadingSlash = /^\//;
const trim = (localePath) => localePath.replace(reLeadingSlash, '');

/**
 * @classdesc Utility class for loading locale files
 * @param {object} config - Configuration
 * @param {LocaleManifest} config.manifest - Locale file manifest
 * @param {string} [config.basePath] - Locale file base path. Defaults to `manifest.basePath`
 * @class
 */
function LocaleUtils(config) {
  const { manifest, debug = () => {} } = config;
  const { basePath = manifest.basePath } = config;
  const { defaultLocale = 'en', localesMap, paths = {}, locales } = manifest;
  const defaultLang = defaultLocale.split('-')[0];

  /**
   * Fallback to the lang part of a locale or to defaultLocale.
   * Strategy is:
   * `<locale>`
   * `<locale lang (if doesn't match default lang)>`
   * `<default locale (if a locale)>`
   * `<default lang>`
   * `null`
   *
   * Here's an example using da-DK/da with en-US as defaultLocale
   * da-DK ==> da ==> en-US ==> en ==> null
   * @param {Locale} locale - Current locale
   * @returns {Locale|Lang|null} language - fallback language to use.
   * @function
   */
  this.getFallbackLocale = (locale = '') => {
    if (locale.indexOf('-') > 0) {
      const language = locale.split('-')[0];

      if (
        defaultLocale.indexOf('-') > 0 &&
        locale !== defaultLocale &&
        language === defaultLang
      ) {
        debug(
          `Fallback for locale ${locale} is default locale ${defaultLocale}`
        );
        return defaultLocale;
      }

      debug(`Fallback for ${locale} is its language ${language}`);
      return language;
    }

    if (locale !== defaultLang) {
      debug(
        `Fallback for language ${locale} is default locale ${defaultLocale}`
      );
      return defaultLocale;
    }

    debug(`No fallback determined for ${locale}`);
    return null;
  };

  /**
   * Format a localePath with provided locale. Ensures path starts with slash
   * and ends with .json file.
   * @param {LocalePathPart} localePathPart - Path containing locale files
   * @param {Locale} locale - Locale
   * @returns {LocalePath} localePath
   * @function
   */
  this.formatLocalePath = (localePathPart, locale) => {
    const cleanPart = '/' + localePathPart.replace(/^\/|\/$/g, '');
    if (reLocalePathParam.test(cleanPart)) {
      return cleanPart.replace(reLocalePathParam, `/${locale}/`);
    }
    return `${cleanPart}/${locale}.json`;
  };

  /**
   * Get a localePathPart from provided string or thunk callback results
   * @param {LocalePathPartOrThunk} localePathPart - Path containing locale files
   * @param {object} [context] - Context
   * @returns {LocalePath} localePath
   * @function
   */
  this.resolveLocalePathPart = (localePathPart, context = {}) => {
    return typeof localePathPart === 'function'
      ? localePathPart(context)
      : localePathPart;
  };

  /**
   * Get a formatted localePath considering language mappings and fallbacks
   * @param {LocalePathPartOrThunk} localePathPart - Path containing locale files
   * @param {Locale} locale - Locale
   * @param {object} [context] - Context
   * @returns {LocalePath} localePath
   * @function
   */
  this.getLocalePath = (localePathPart, locale, context = {}) => {
    const mappedLocale = (localesMap && localesMap[locale]) || locale;
    debug(`Mapped locale for ${locale} is ${mappedLocale}`);

    let fallbackLocale = mappedLocale;

    if (locales && !locales.includes(mappedLocale)) {
      fallbackLocale = defaultLocale;
    }

    const resolvedLocalePathPart = this.resolveLocalePathPart(
      localePathPart,
      context
    );

    while (fallbackLocale != null) {
      const localePath = this.formatLocalePath(
        resolvedLocalePathPart,
        fallbackLocale
      );
      if (trim(localePath) in paths) {
        debug(`Locale file for ${locale} is ${localePath}`);
        return localePath;
      }

      fallbackLocale = this.getFallbackLocale(fallbackLocale);
    }

    const result = this.formatLocalePath(resolvedLocalePathPart, mappedLocale);
    debug(`Locale file for ${locale} is ${result}`);
    return result;
  };

  /**
   * Add base path from window.gasket.intl or manifest if set to the locale path
   * @param {LocalePath} localePath - URL path to a locale file
   * @returns {string} url
   * @function
   */
  this.pathToUrl = (localePath) => {
    let url = basePath ? basePath.replace(/\/$/, '') + localePath : localePath;
    const hash = paths[trim(localePath)];
    if (hash) url += `?v=${hash}`;
    debug(`URL for ${localePath} is ${url}`);
    return url;
  };

  /* eslint-disable no-unused-vars, valid-jsdoc */
  /**
   * Load locale file(s) and return localesProps.
   * Throws error if attempted to use in browser.
   * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
   * @param {Locale} locale - Locale to load
   * @param {string} localesDir - Disk path to locale files dir
   * @returns {LocalesProps} localesProps
   */
  this.serverLoadData = (localePathPart, locale, localesDir) => {
    throw new Error('Not available in browser');
  };
  /* eslint-enable */
}

module.exports = {
  LocaleUtils,
  LocaleStatus
};
