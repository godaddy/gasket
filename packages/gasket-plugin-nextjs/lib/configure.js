
/**
 * Set up configuration.
 *
 * If the service worker plugin, only the _app entry is configured to be
 * injected with registration script.
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} baseConfig - Base gasket config
 * @returns {Object} config
 */
function configure(gasket, baseConfig = {}) {
  const { nextConfig = {} } = baseConfig;

  const serviceWorker = {
    webpackRegister: (key) => /_app/.test(key),
    ...(baseConfig.serviceWorker || {})
  };
  return { ...baseConfig, serviceWorker, nextConfig };
}

module.exports = configure;
