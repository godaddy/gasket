const path = require('path');
const { withGasketRequestCache } = require('@gasket/request');
const getPreferredLocale = require('./utils/get-preferred-locale');

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

module.exports = {
  getIntlLocale,
  getIntlManager
};
