// @ts-nocheck - handled by other PR
/// <reference types="@gasket/plugin-elastic-apm" />

import debug from 'debug';
const debugLog = debug('gasket:plugin:intl:apmTransaction');

/** @type {import('@gasket/core').HookHandler<'apmTransaction'>} */
export default async function apmTransaction(gasket, transaction, { req }) {
  const locale = await gasket.actions.getIntlLocale(req);

  if (locale) {
    debugLog(`Setting locale label for transaction to ${locale}`);
    transaction.setLabel('locale', locale);
  } else {
    debugLog('Locale could not be determined for transaction');
  }
}
