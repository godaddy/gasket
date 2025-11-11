/* -- GENERATED FILE - DO NOT EDIT -- */
import { makeIntlManager } from '@gasket/intl';
import type { LocaleManifest } from '@gasket/intl';

const manifest: LocaleManifest = {
  defaultLocaleFilePath: 'locales',
  staticLocaleFilePaths: [
    'locales'
  ],
  defaultLocale: 'en-US',
  locales: [
    'en-US',
    'es-MX',
    'fr-FR'
  ],
  localesMap: {},
  imports: {
    'locales/en-US': () => import('./public/locales/en-US.json'),
    'locales/es-MX': () => import('./public/locales/es-MX.json'),
    'locales/fr-FR': () => import('./public/locales/fr-FR.json')
  }
};

export default makeIntlManager(manifest);

