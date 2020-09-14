
exports = global.fetch; // To import fetch from @gasket/fetch
exports.default = global.fetch; // For TypeScript consumers without esModuleInterop.
exports.fetch = global.fetch; // To import {fetch} from @gasket/fetch
exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;

module.exports = exports;
