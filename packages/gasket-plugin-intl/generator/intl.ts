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
    'en-US'
  ],
  localesMap: {},
  imports: {
    'locales/en-US': () => import('./locales/en-US.json')
  }
};

export default makeIntlManager(manifest);
