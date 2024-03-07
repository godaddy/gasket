/* eslint-disable spaced-comment */
// @ts-check
/// <reference types="./index" />
/// <reference types="../../gasket-plugin-nextjs" />

/**
 * @typedef {import('@gasket/engine').Gasket} Gasket
 * @typedef {import('http').IncomingMessage}  Request
 * @typedef {import('http').ServerResponse}   Response
 */

const { callbackify } = require('util');

/**
 * Middleware for customizing transactions
 *
 * @param {Gasket}    gasket  The Gasket engine
 * @param {Request}   req     The HTTP request being handled
 * @param {Response}  res     The server response
 */
async function customizeTransaction(gasket, req, res) {
  const apm = gasket.apm;

  if (!apm.isStarted()) {
    return;
  }

  const transaction = apm.currentTransaction;
  if (!transaction) {
    return;
  }

  await gasket.exec('apmTransaction', transaction, { req, res });
}

module.exports = (gasket) => [
  callbackify(async (req, res) => customizeTransaction(gasket, req, res))
];
