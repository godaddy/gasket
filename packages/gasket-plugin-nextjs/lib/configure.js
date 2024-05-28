/// <reference types="@gasket/plugin-service-worker" />


/** @type {import('@gasket/core').HookHandler<'configure'>} */
function configure(gasket, baseConfig) {
  const { nextConfig = {} } = baseConfig ?? {};

  const serviceWorker = {
    webpackRegister: (key) => /_app/.test(key),
    ...(baseConfig.serviceWorker || {})
  };
  return { ...baseConfig, serviceWorker, nextConfig };
}

module.exports = configure;
