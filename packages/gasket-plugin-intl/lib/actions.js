const { withGasketRequestCache } = require('@gasket/request');
const getPreferredLocale = require('./utils/get-preferred-locale');

/** @type {import('@gasket/core').ActionHandler<'getIntlLocale'>} */
const getIntlLocale = withGasketRequestCache(
  /** @type {import('@gasket/core').ActionHandler<'getIntlLocale'>} */
  async function getIntlLocale(gasket, req) {
    return gasket.execWaterfall(
      'intlLocale',
      getPreferredLocale(gasket, req),
      { req }
    );
  }
);

/** @type {import('@gasket/core').ActionHandler<'getIntlManager'>} */
function getIntlManager(gasket) {
  if (!gasket.config.intl.manager) {
    throw new Error('IntlManager not configured (gasket.config.intl.manager)');
  }
  return gasket.config.intl.manager;
}

module.exports = {
  getIntlLocale,
  getIntlManager
};
