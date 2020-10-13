import { basePath, clientData, isBrowser, manifest } from './config';
import { LocaleUtils } from '@gasket/helper-intl';

export const localeUtils = new LocaleUtils({ manifest, basePath });

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

/**
 * Determines the active locale from either what was rendered for the page (preferred),
 * or what is set in navigator.languages for the browser.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages#Browser_compatibility
 *
 * @returns {Locale} locale
 */
export function getActiveLocale() {
  if (isBrowser) {
    return window.gasketIntlLocale ?? clientData.locale ?? navigator.languages[0];
  }
  return manifest.defaultLocale;
}
