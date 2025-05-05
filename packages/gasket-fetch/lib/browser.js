/**
 * A wrapper around window.fetch to allow polyfills or monkey-patching.
 *
 * This function behaves like the native fetch but is exposed as a module export,
 * with support for CommonJS and TypeScript interop. It also exposes the standard
 * fetch-related constructors as static properties.
 * @type {import('.').fetchWrapper}
 * @see https://developer.mozilla.org/docs/Web/API/fetch
 */
function fetchWrapper(input, init) {
  return window.fetch(input, init);
}

// Attach additional properties for compatibility and polyfill support
fetchWrapper.default = fetchWrapper; // For TypeScript consumers without esModuleInterop
fetchWrapper.Headers = window.Headers;
fetchWrapper.Request = window.Request;
fetchWrapper.Response = window.Response;
fetchWrapper.AbortController = window.AbortController;

module.exports = fetchWrapper;
