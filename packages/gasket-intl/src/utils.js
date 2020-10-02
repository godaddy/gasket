import { basePath, defaultLocale, manifest } from './config';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const ERROR = 'error';

const reLocale = /(\/[$:{]locale}?\/)/;
const defaultLang = defaultLocale.split('-')[0];

/**
 * The language codes will fall back in this sequence (da-DK/da used as an example language)
 * da-DK ==> da ==> en-US ==> en ==> null
 *
 * @param {string} locale - current language.
 * @returns {string} language - fallback language to use.
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
 *
 * @param localePath
 * @param locale
 * @return {string|*}
 */
export function formatLocalePath(localePath, locale) {
  if (reLocale.test(localePath)) {
    return localePath.replace(reLocale, `/${locale}/`);
  }
  return `${ localePath }/${ locale }.json`;
}

/**
 *
 * @param localePath
 * @param locale
 * @return {string}
 */
export function getLocalePath(localePath, locale) {
  const mappedLocale = manifest.localeMap && manifest.localeMap[locale] || locale;
  let fallbackLocale = mappedLocale;

  while (fallbackLocale !== null) {
    const pathName = formatLocalePath(localePath, fallbackLocale);
    if (pathName in manifest.paths) return pathName;
    fallbackLocale = getFallbackLocale(fallbackLocale);
  }
  return formatLocalePath(localePath, mappedLocale);
}

/**
 * Add base path from window.gasket.intl or manifest if set to the locale path
 *
 * @param {string} pathName - URL path to a locale file
 * @returns {string} url
 */
export function pathToUrl(pathName) {
  return basePath ? `${basePath}/${pathName}` : pathName;
}
