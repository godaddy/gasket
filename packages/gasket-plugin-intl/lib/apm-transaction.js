const debug = require('debug')('gasket:plugin:intl:apmTransaction');

module.exports = (_gasket, transaction, { res }) => {
  const { locale } = res.locals.gasketData ?? {};
  if (locale) {
    debug(`Setting locale label for transaction to ${locale}`);
    transaction.setLabel('locale', locale);
  } else {
    debug('Locale could not be determined for transaction');
  }
};
