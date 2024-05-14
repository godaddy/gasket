/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-log" />
/// <reference types="@gasket/plugin-service-worker" />

/**
 * Set up configuration.
 *
 * If the service worker plugin, only the _app entry is configured to be
 * injected with registration script.
 */
module.exports = {
  timing: {
    first: true // Fixup next -> nextConfig early for reference by other plugins
  },
  /** @type {import('@gasket/engine').HookHandler<'configure'>} */
  handler: function configure(gasket, baseConfig) {
    const { logger } = gasket;

    const { next, ...rest } = baseConfig;

    if (next) {
      logger.warning('DEPRECATED `next` in Gasket config - use `nextConfig`');
    }

    const { nextConfig = next || {} } = baseConfig;

    const serviceWorker = {
      webpackRegister: (key) => /_app/.test(key),
      ...(baseConfig.serviceWorker || {})
    };

    return { ...rest, serviceWorker, nextConfig };
  }
};
