/// <reference types="@gasket/plugin-service-worker" />

/**
 * Register a cache key function to get the language for a request
 * @type {import('@gasket/core').HookHandler<'serviceWorkerCacheKey'>}
 */
module.exports = async function serviceWorkerCacheKey() {
  return function getLocale(req, res) {
    const { locals: { gasketData: { intl: { locale } = {} } = {} } = {} } = res;

    return locale;
  };
};
