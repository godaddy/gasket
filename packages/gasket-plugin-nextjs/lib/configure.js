/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-log" />
/// <reference types="@gasket/plugin-service-worker" />


/** @type {import('@gasket/engine').HookHandler<'configure'>} */
function configure(gasket, baseConfig = {}) {
  const { nextConfig = {} } = baseConfig;

  const serviceWorker = {
    webpackRegister: (key) => /_app/.test(key),
    ...(baseConfig.serviceWorker || {})
  };
  return { ...baseConfig, serviceWorker, nextConfig };
}

module.exports = configure;
