const getPreferredLocale = require('./utils/get-preferred-locale');

const reqMap = new WeakMap();
/**
 * @type {import('@gasket/core').HookHandler<'actions'>}
 */
module.exports = function actions(gasket) {
  return {
    async getIntlLocale(req) {
      if (!reqMap.has(req)) {
        const intlLocale = await gasket.execWaterfall(
          'intlLocale',
          getPreferredLocale(gasket, req),
          { req }
        );

        reqMap.set(req, intlLocale);
      }

      return reqMap.get(req);
    },
    getIntlManager() {
      if (!gasket.config.intl.manager) {
        throw new Error('IntlManager not configured (gasket.config.intl.manager)');
      }
      return gasket.config.intl.manager;
    }
  };
};
