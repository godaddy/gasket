import { basePath, defaultLocale, manifest } from './config';

/**
 * Partial URL representing a directory containing locale .json files
 * or a URL template with a `:locale` path param to a .json file.
 * @typedef {string} LocalePathPart
 *
 * @example
 * "/locales"
 *
 * @example
 * "/locales/:locale/component.json"
 */

/**
 * URL path to a locale .json file
 * @typedef {string} LocalePath
 *
 * @example
 * "/locales/en-US.json"
 *
 * @example
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
 * Fetch status of a locale file
 * @typedef {string} LocalePathStatus
 * @readonly
 */

/** @type {LocalePathStatus} */
export const LOADING = 'loading';
/** @type {LocalePathStatus} */
export const LOADED = 'loaded';
/** @type {LocalePathStatus} */
export const ERROR = 'error';

const reLocale = /(\/[$:{]locale}?\/)/;
const defaultLang = defaultLocale.split('-')[0];

/**
 * Fallback to the lang part of a locale or to defaultLocale.
 *
 * Here's an example using da-DK/da with en-US as defaultLocale
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {Locale} locale - current language.
 * @returns {Locale|Lang|null} language - fallback language to use.
 */
export function getFallbackLocale(locale = '') {
  if (locale.indexOf('-') > 0) {
    return locale.split('-')[0];
  }

  if (locale !== defaultLang) {
    return defaultLocale;
  }

  return null;
}

/**
 * Format a localePath with provide locale
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @param {Locale} locale - Locale
 * @returns {LocalePath} localePath
 */
export function formatLocalePath(localePathPart, locale) {
  if (reLocale.test(localePathPart)) {
    return localePathPart.replace(reLocale, `/${ locale }/`);
  }
  return `${ localePathPart }/${ locale }.json`;
}

/**
 * Get a formatted localePath considering language mappings and fallbacks
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @param {Locale} locale - Locale
 * @returns {LocalePath} localePath
 */
export function getLocalePath(localePathPart, locale) {
  const mappedLocale = manifest.localeMap && manifest.localeMap[locale] || locale;
  let fallbackLocale = mappedLocale;

  while (fallbackLocale !== null) {
    const localePath = formatLocalePath(localePathPart, fallbackLocale);
    if (localePath in manifest.paths) return localePath;
    fallbackLocale = getFallbackLocale(fallbackLocale);
  }
  return formatLocalePath(localePathPart, mappedLocale);
}

/**
 * Add base path from window.gasket.intl or manifest if set to the locale path
 *
 * @param {LocalePath} localePath - URL path to a locale file
 * @returns {string} url
 */
export function pathToUrl(localePath) {
  let url = basePath ? basePath.replace(/\/$/, '') + localePath : localePath;
  const hash = manifest.paths[localePath];
  if (hash) url += `?v=${ hash }`;
  return url;
}
