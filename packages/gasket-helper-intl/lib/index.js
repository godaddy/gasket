/**
 * NOTICE! These are common utilities used by packages in browser and node.
 * Do not rely on req, or window.
 */

const LocaleStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

const reLocalePathParam = /(\/[$:{]locale}?\/)/;
const reLeadingSlash = /^\//;
const trim = (localePath) => localePath.replace(reLeadingSlash, '');

// REVIEW
/** @type {import('./index').LocaleUtils} */
class LocaleUtils {
  constructor(config) {
    const { manifest, debug = () => {} } = config;
    const { basePath = manifest.basePath } = config;
    const { defaultLocale = 'en', localesMap, paths = {}, locales } = manifest;
    const defaultLang = defaultLocale.split('-')[0];

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

    this.formatLocalePath = (localePathPart, locale) => {
      const cleanPart = '/' + localePathPart.replace(/^\/|\/$/g, '');
      if (reLocalePathParam.test(cleanPart)) {
        return cleanPart.replace(reLocalePathParam, `/${locale}/`);
      }
      return `${cleanPart}/${locale}.json`;
    };

    this.resolveLocalePathPart = (localePathPart, context = {}) => {
      return typeof localePathPart === 'function'
        ? localePathPart(context)
        : localePathPart;
    };

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

      const result = this.formatLocalePath(
        resolvedLocalePathPart,
        mappedLocale
      );
      debug(`Locale file for ${locale} is ${result}`);
      return result;
    };

    this.pathToUrl = (localePath) => {
      let url = basePath
        ? basePath.replace(/\/$/, '') + localePath
        : localePath;
      const hash = paths[trim(localePath)];
      if (hash) url += `?v=${hash}`;
      debug(`URL for ${localePath} is ${url}`);
      return url;
    };

    this.serverLoadData = () => {
      throw new Error('Not available in browser');
    };
  }
}

module.exports = {
  LocaleUtils,
  LocaleStatus
};
