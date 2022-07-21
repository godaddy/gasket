/* eslint-disable spaced-comment */
// @ts-check
/// <reference types="../../gasket-plugin-nextjs" />

/**
 * @typedef {import('@gasket/engine').Gasket} Gasket
 * @typedef {import('http').IncomingMessage}  Request
 * @typedef {import('http').ServerResponse}   Response
 */

const { callbackify } = require('util');
const apm = require('elastic-apm-node');

/**
 * Middleware which renames transactions
 *
 * @param {Gasket}    gasket  The Gasket engine
 * @param {Request}   req     The HTTP request being handled
 * @param {Response}  res     The server response
 */
async function transactionRenamingMiddleware(gasket, req, res) {
  const transaction = apm.currentTransaction;
  if (!transaction) {
    return;
  }

  const requestDetails = { req, res };

  const [name, labels] = await Promise.all([
    gasket.execWaterfall('transactionName', transaction.name, requestDetails),
    gasket.execWaterfall('transactionLabels', {}, requestDetails)
  ]);

  transaction.name = name;
  transaction.addLabels(labels);
}

module.exports = (gasket) => [
  callbackify(async (req, res) => transactionRenamingMiddleware(gasket, req, res))
];
