/**
 * NOTICE! These are common utilities used by packages in browser and this plugin.
 * Do not rely on req, or window.
 */

const path = require('path');
const merge = require('lodash.merge');

/**
 * Partial URL representing a directory containing locale .json files
 * or a URL template with a `:locale` path param to a .json file.
 * @typedef {string} LocalePathPart
 *
 * @example
 * "/locales"
 *
 * @example
 * // as a template
 * "/locales/:locale/component.json"
 *
 * @example
 * // other param formats
 * "/locales/$locale/component.json"
 * "/locales/{locale}/component.json"
 */

/**
 * URL path to a locale .json file
 * @typedef {string} LocalePath
 *
 * @example
 * "/locales/en-US.json"
 *
 * @example
 * // from a template
 * "/locales/en-US/component.json"
 */

/**
 * Language code only
 * @typedef {string} Lang
 *
 * @example
 * "en"
 */

/**
 * Language code with region
 * @typedef {Lang} Locale
 *
 * @example
 * "en-US"
 */

/**
 * State of loaded locale files
 *
 * @typedef {object} LocalesState
 * @property {{string: string}} messages
 * @property {{LocalePath: LocalePathStatus}} status
 */

/**
 * Props for a Next.js page containing locale and initial state
 *
 * @typedef {LocalesState} LocalesProps
 * @property {Locale} locale
 */

/**
 * Fetch status of a locale file
 * @typedef {string} LocalePathStatus
 * @readonly
 */

/** @type {LocalePathStatus} */
const LOADING = 'loading';
/** @type {LocalePathStatus} */
const LOADED = 'loaded';
/** @type {LocalePathStatus} */
const ERROR = 'error';

const reLocalePathParam = /(\/[$:{]locale}?\/)/;

/**
 * Utility class for loading locale files
 *
 * @param {Object} config - Configuration
 * @param {LocaleManifest} config.manifest - Locale file manifest
 * @param {string} [config.basePath] - Locale file base path. Defaults to `manifest.basePath`
 * @constructor
 */
function LocaleUtils(config) {
  const { manifest } = config;
  const { basePath = manifest.basePath } = config;
  const { defaultLocale = 'en', localesMap, paths } = manifest;
  const defaultLang = defaultLocale.split('-')[0];

  /**
   * Fallback to the lang part of a locale or to defaultLocale.
   *
   * Here's an example using da-DK/da with en-US as defaultLocale
   * da-DK ==> da ==> en-US ==> en ==> null
   *
   * @param {Locale} locale - Current locale
   * @returns {Locale|Lang|null} language - fallback language to use.
   * @method
   */
  this.getFallbackLocale = (locale = '') => {
    if (locale.indexOf('-') > 0) {
      return locale.split('-')[0];
    }

    if (locale !== defaultLang) {
      return defaultLocale;
    }

    return null;
  };

  /**
   * Format a localePath with provided locale. Ensures path starts with slash
   * and ends with .json file.
   *
   * @param {LocalePathPart} localePathPart - Path containing locale files
   * @param {Locale} locale - Locale
   * @returns {LocalePath} localePath
   * @method
   */
  this.formatLocalePath = (localePathPart, locale) => {
    const cleanPart = '/' + localePathPart.replace(/^\/|\/$/g, '');
    if (reLocalePathParam.test(cleanPart)) {
      return cleanPart.replace(reLocalePathParam, `/${ locale }/`);
    }
    return `${ cleanPart }/${ locale }.json`;
  };

  /**
   * Get a formatted localePath considering language mappings and fallbacks
   *
   * @param {LocalePathPart} localePathPart - Path containing locale files
   * @param {Locale} locale - Locale
   * @returns {LocalePath} localePath
   * @method
   */
  this.getLocalePath = (localePathPart, locale) => {
    const mappedLocale = localesMap && localesMap[locale] || locale;
    let fallbackLocale = mappedLocale;

    while (fallbackLocale !== null) {
      const localePath = this.formatLocalePath(localePathPart, fallbackLocale);
      if (localePath in paths) return localePath;
      fallbackLocale = this.getFallbackLocale(fallbackLocale);
    }
    return this.formatLocalePath(localePathPart, mappedLocale);
  };

  /**
   * Add base path from window.gasket.intl or manifest if set to the locale path
   *
   * @param {LocalePath} localePath - URL path to a locale file
   * @returns {string} url
   * @method
   */
  this.pathToUrl = (localePath) => {
    let url = basePath ? basePath.replace(/\/$/, '') + localePath : localePath;
    const hash = paths[localePath];
    if (hash) url += `?v=${ hash }`;
    return url;
  };

  /**
   * Load locale file(s) and return localesProps
   *
   * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
   * @param {Locale} locale - Locale to load
   * @param {string} localesDir - Disk path to locale files dir
   * @returns {LocalesProps} localesProps
   */
  this.serverLoadData = (localePathPath, locale, localesDir) => {
    if (Array.isArray(localePathPath)) {
      const localesProps = localePathPath.map(p => this.serverLoadData(p, locale, localesDir));
      return merge(...localesProps);
    }

    const localeFile = this.getLocalePath(localePathPath, locale);
    const diskPath = path.join(localesDir, localeFile);
    let messages;
    let status;

    try {
      messages = require(diskPath);
      status = LOADED;
    } catch (e) {
      console.error(e.message); // eslint-disable-line no-console
      messages = {};
      status = ERROR;
    }

    return {
      locale,
      messages: {
        [locale]: {
          ...messages
        }
      },
      status: {
        [localeFile]: status
      }
    };
  };
}

module.exports = {
  LocaleUtils,
  LOADING,
  LOADED,
  ERROR
};
