import path from 'node:path';
import { withGasketRequestCache } from '@gasket/request';
import getPreferredLocale from './utils/get-preferred-locale.js';

/** @type {import('@gasket/core').ActionHandler<'getIntlLocale'>} */
const getIntlLocale = withGasketRequestCache(
  async function getIntlLocale(gasket, req) {
    return gasket.execWaterfall(
      'intlLocale',
      getPreferredLocale(gasket, req),
      { req }
    );
  }
);

/** @type {import('@gasket/core').ActionHandler<'getIntlManager'>} */
async function getIntlManager(gasket) {
  if (!gasket.config.intl.managerFilename) {
    throw new Error('IntlManager not configured (gasket.config.intl.managerFilename)');
  }

  if (!gasket.config.intl.experimentalImportAttributes) {
    throw new Error('To use experimental import attributes you must configure `gasket.config.intl.experimentalImportAttributes`');
  }

  return (await import(path.join(gasket.config.root, gasket.config.intl.managerFilename))).default;
}

export default {
  getIntlLocale,
  getIntlManager
};
