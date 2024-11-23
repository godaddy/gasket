const { withGasketRequest } = require('@gasket/request');

/** @type {import('@gasket/core').ActionHandler<'getApmTransaction'>} */
const getApmTransaction = withGasketRequest(
  async function getApmTransaction(gasket, req) {
    const apm = require('elastic-apm-node');

    if (!apm?.isStarted()) {
      return;
    }

    const transaction = apm.currentTransaction;
    if (!transaction) {
      return;
    }

    await gasket.exec('apmTransaction', transaction, { req });

    return transaction;
  }
);

module.exports = {
  getApmTransaction
};
