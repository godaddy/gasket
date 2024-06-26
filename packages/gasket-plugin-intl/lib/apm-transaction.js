/// <reference types="@gasket/plugin-elastic-apm" />

const debug = require('debug')('gasket:plugin:intl:apmTransaction');

/** @type {import('@gasket/core').HookHandler<'apmTransaction'>} */
module.exports = async function apmTransaction(gasket, transaction, { req }) {
  // @ts-expect-error - TODO: fix typings for GasketRequest
  const gasketData = await gasket.actions.getPublicGasketData(req);
  const { locale } = gasketData?.intl ?? {};

  if (locale) {
    debug(`Setting locale label for transaction to ${locale}`);
    transaction.setLabel('locale', locale);
  } else {
    debug('Locale could not be determined for transaction');
  }
};
