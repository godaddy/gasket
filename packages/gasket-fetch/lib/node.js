/**
 * Polyfilled fetch module for Node.js environments.
 *
 * This module uses `node-fetch` as the base fetch implementation
 * and attaches `AbortController` support from the `abort-controller` package.
 * @see https://www.npmjs.com/package/node-fetch
 * @see https://www.npmjs.com/package/abort-controller
 * @type {import('.').fetch}
 */
const fetch = require('node-fetch');

fetch.AbortController = require('abort-controller');

module.exports = fetch;
