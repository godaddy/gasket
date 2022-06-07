// Wrapper to access window.fetch in case of polyfill or monkey patch
function fetchWrapper(...args) {
  return window.fetch(...args);
}

exports = fetchWrapper; // To import fetch from @gasket/fetch
exports.default = fetchWrapper; // For TypeScript consumers without esModuleInterop.
exports.Headers = window.Headers;
exports.Request = window.Request;
exports.Response = window.Response;
exports.AbortController = window.AbortController;

module.exports = exports;
