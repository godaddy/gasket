/// <reference types="@gasket/plugin-express" />

/**
 * Middleware for customizing transactions
 * @param {import('@gasket/core').Gasket} gasket - The Gasket engine
 * @param {import('http').IncomingMessage} req - The HTTP request being handled
 */
async function customizeTransaction(gasket, req) {
  const apm = gasket.apm;

  if (!apm?.isStarted()) {
    return;
  }

  const transaction = apm.currentTransaction;
  if (!transaction) {
    return;
  }

  await gasket.exec('apmTransaction', transaction, { req });
}

/**
 * Add middleware to gather config details
 * @type {import('@gasket/core').HookHandler<'middleware'>}
 */
module.exports = function middleware(gasket) {
  return (
    gasket.apm &&
    async function apmTransactionMiddleware(req, res, next) {
      try {
        customizeTransaction(gasket, req);
      } catch (error) {
        return next(error);
      }
      next();
    }
  );
};
