/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  return {
    async getApmTransaction(req) {
      const apm = gasket.apm;

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
  };
};
