
exports = window.fetch; // To import fetch from @gasket/fetch
exports.default = window.fetch; // For TypeScript consumers without esModuleInterop.
exports.fetch = window.fetch; // To import {fetch} from @gasket/fetch
exports.Headers = window.Headers;
exports.Request = window.Request;
exports.Response = window.Response;
exports.AbortController = window.AbortController;

module.exports = exports;
