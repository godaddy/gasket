// @ts-nocheck - handled by other PR
/// <reference types="@gasket/plugin-elastic-apm" />

const debug = require('debug')('gasket:plugin:intl:apmTransaction');

/** @type {import('@gasket/core').HookHandler<'apmTransaction'>} */
module.exports = function apmTransaction(_gasket, transaction, { res }) {
  // TODO: convert to actions
  const { locale } = res.locals.gasketData ?? {};

  if (locale) {
    debug(`Setting locale label for transaction to ${locale}`);
    transaction.setLabel('locale', locale);
  } else {
    debug('Locale could not be determined for transaction');
  }
};
