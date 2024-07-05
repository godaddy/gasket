/// <reference types="@gasket/plugin-service-worker" />

/**
 * Register a cache key function to get the language for a request
 * @type {import('@gasket/core').HookHandler<'serviceWorkerCacheKey'>}
 */
module.exports = async function serviceWorkerCacheKey(gasket, req) {
  const gasketData = await gasket.actions.getPublicGasketData(req);
  return function getLocale() {
    return gasketData?.intl?.locale;
  };
};
