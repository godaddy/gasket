/// <reference types="@gasket/plugin-express" />

const apm = require('elastic-apm-node');

/**
 * Middleware for customizing transactions
 * @param {import('@gasket/core').Gasket} gasket - The Gasket engine
 * @param {import('http').IncomingMessage} req - The HTTP request being handled
 */
async function customizeTransaction(gasket, req) {
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
  // eslint-disable-next-line no-undefined
  const isStarted = apm.isStarted() || undefined;
  return (
    isStarted &&
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
