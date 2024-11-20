const path = require('path');
const getPreferredLocale = require('./utils/get-preferred-locale');

const reqMap = new WeakMap();


/** @type {import('@gasket/core').ActionHandler<'getIntlLocale'>} */
async function getIntlLocale(gasket, req) {
  if (!reqMap.has(req)) {
    const intlLocale = gasket.execWaterfall(
      'intlLocale',
      getPreferredLocale(gasket, req),
      { req }
    );

    reqMap.set(req, intlLocale);
  }

  return reqMap.get(req);
}

/** @type {import('@gasket/core').ActionHandler<'getIntlManager'>} */
async function getIntlManager(gasket) {
  if (!gasket.config.intl.managerFilename) {
    throw new Error('IntlManager not configured (gasket.config.intl.managerFilename)');
  }

  return (await import(path.join(gasket.config.root, gasket.config.intl.managerFilename))).default;
}

module.exports = {
  getIntlLocale,
  getIntlManager
};
