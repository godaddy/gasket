import { basePath, clientData, isBrowser, manifest } from './config';
import { LocaleUtils } from '@gasket/helper-intl';

export const localeUtils = new LocaleUtils({ manifest, basePath });

export { LocaleStatus } from '@gasket/helper-intl';

/**
 * Determines the active locale from either what was rendered for the page (preferred),
 * or what is set in navigator.languages for the browser.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages#Browser_compatibility
 * @returns {string} locale
 */
export function getActiveLocale() {
  if (isBrowser) {
    return (
      // @ts-ignore
      window.gasketIntlLocale ?? clientData.locale ?? navigator.languages[0]
    );
  }
  return manifest.defaultLocale;
}
