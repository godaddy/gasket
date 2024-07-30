/* -- GENERATED FILE - DO NOT EDIT -- */
import { makeIntlManager } from '@gasket/intl';

const manifest = {
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
