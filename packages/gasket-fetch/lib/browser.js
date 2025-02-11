/**
 * Wrapper to access window.fetch in case of polyfill or monkey patch
 * @type {import('@gasket/fetch').fetch}
 */
function fetchWrapper(input, init) {
  return window.fetch(input, init);
}

// @ts-ignore - TS doesn't like adding properties to a function
exports = fetchWrapper; // To import fetch from @gasket/fetch
exports.default = fetchWrapper; // For TypeScript consumers without esModuleInterop.
exports.Headers = window.Headers;
exports.Request = window.Request;
exports.Response = window.Response;
exports.AbortController = window.AbortController;

module.exports = exports;
