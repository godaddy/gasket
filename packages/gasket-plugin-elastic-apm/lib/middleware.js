/// <reference types="@gasket/plugin-express" />

/**
 * Middleware for customizing transactions
 * @param {import('@gasket/engine').Gasket} gasket - The Gasket engine
 * @param {import('http').IncomingMessage} req - The HTTP request being handled
 * @param {import('http').ServerResponse} res - The server response
 */
async function customizeTransaction(gasket, req, res) {
  const apm = gasket.apm;

  if (!apm?.isStarted()) {
    return;
  }

  const transaction = apm.currentTransaction;
  if (!transaction) {
    return;
  }

  await gasket.exec('apmTransaction', transaction, { req, res });
}

/**
 * Add middleware to gather config details
 * @type {import('@gasket/engine').HookHandler<'middleware'>}
 */
module.exports = function middleware(gasket) {
  return (
    gasket.apm &&
    async function apmTransactionMiddleware(req, res, next) {
      try {
        customizeTransaction(gasket, req, res);
      } catch (error) {
        return next(error);
      }
      next();
    }
  );
};
