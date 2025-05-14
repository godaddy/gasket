// @ts-nocheck - handled by other PR
/// <reference types="@gasket/plugin-elastic-apm" />

const debug = require('debug')('gasket:plugin:intl:apmTransaction');

/** @type {import('@gasket/core').HookHandler<'apmTransaction'>} */
module.exports = async function apmTransaction(gasket, transaction, { req }) {
  const locale = await gasket.actions.getIntlLocale(req);

  if (locale) {
    debug(`Setting locale label for transaction to ${locale}`);
    transaction.setLabel('locale', locale);
  } else {
    debug('Locale could not be determined for transaction');
  }
};
