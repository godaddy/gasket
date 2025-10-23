import { withGasketRequestCache } from '@gasket/request';

/** @type {import('@gasket/core').ActionHandler<'getApmTransaction'>} */
export const getApmTransaction = withGasketRequestCache(
  async function getApmTransaction(gasket, req) {
    const apm = await import('elastic-apm-node');

    if (!apm?.default?.isStarted()) {
      return;
    }

    const transaction = apm.default.currentTransaction;
    if (!transaction) {
      return;
    }

    await gasket.exec('apmTransaction', transaction, { req });

    return transaction;
  }
);
