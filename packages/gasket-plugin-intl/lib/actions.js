const getPreferredLocale = require('./utils/get-preferred-locale');

const reqMap = new WeakMap();

module.exports = {
  /** @type {import('@gasket/core').ActionHandler<'getIntlLocale'>} */
  async getIntlLocale(gasket, req) {
    if (!reqMap.has(req)) {
      const intlLocale = gasket.execWaterfall(
        'intlLocale',
        getPreferredLocale(gasket, req),
        { req }
      );

      reqMap.set(req, intlLocale);
    }

    return reqMap.get(req);
  },
  /** @type {import('@gasket/core').ActionHandler<'getIntlManager'>} */
  getIntlManager(gasket) {
    if (!gasket.config.intl.manager) {
      throw new Error('IntlManager not configured (gasket.config.intl.manager)');
    }
    return gasket.config.intl.manager;
  }
};
