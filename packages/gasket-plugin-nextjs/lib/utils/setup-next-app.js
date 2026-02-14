/// <reference types="@gasket/plugin-https" />

/**
 * Get a default fallback port depending on the environment.
 * @param {string} env - Environment string from gasket config
 * @returns {number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Determines the port from HTTP-related config or falls back.
 * @param {import('@gasket/core').GasketConfig} config - Gasket config object
 * @returns {number} Resolved port
 */
function resolvePort(config) {
  const { http, https, http2, env } = config;
  const _http = http || https || http2;

  // Handle different config shapes: number, object with port, or array
  if (typeof _http === 'number') {
    return _http;
  }
  if (_http && typeof _http === 'object' && !Array.isArray(_http) && _http.port) {
    return _http.port;
  }

  return getPortFallback(env);
}

/**
 * Determine if the server is running in dev mode.
 * @returns {boolean} True if GASKET_DEV is set
 */
function isDevServer() {
  // eslint-disable-next-line no-process-env
  return Boolean(process.env.GASKET_DEV); // TODO document GASKET_DEV
}

/**
 * Type guard to check if serverApp is an Express app.
 * @param {unknown} app - The server application to check
 * @returns {app is import('express').Application} True if app is an Express application
 */
function isExpressApp(app) {
  return app != null &&
    typeof app === 'function' &&
    typeof /** @type {any} */ (app).use === 'function' &&
    typeof /** @type {any} */ (app).set === 'function';
}

/**
 * Type guard to check if serverApp is a Fastify app.
 * @param {unknown} app - The server application to check
 * @returns {boolean} True if app is a Fastify application
 */
function isFastifyApp(app) {
  return app != null &&
    typeof app === 'object' &&
    typeof /** @type {any} */ (app).route === 'function' &&
    typeof /** @type {any} */ (app).inject === 'function';
}

/**
 * Creates and prepares a Next.js app instance based on gasket config.
 * @type {import('../index.js').setupNextApp}
 */
async function setupNextApp(gasket) {
  const { config } = gasket;
  const mod = /** @type {any} */ (await import('next'));
  const createNextApp = typeof mod === 'function' ? mod : mod.default;

  /**
   * Cast to any because Next.js 15+ does not expose NextServer type publicly.
   * In real apps, createNextApp() always returns a NextServer shape.
   */
  const app = /** @type {any} */ (createNextApp({
    dev: isDevServer(),
    hostname: config.hostname,
    port: resolvePort(config),
    webpack: true
  }));

  await gasket.exec('next', app);
  await app.prepare();

  return app;
}

/**
 * Sets up the Next.js request handler as the final middleware handler.
 *
 * Supports both Express and Fastify servers.
 * @type {import('../index.js').setupNextHandling}
 */
function setupNextHandling(nextServer, serverApp, gasket) {
  const nextHandler = nextServer.getRequestHandler();
  const gasketRoot = gasket.traceRoot();

  if (isExpressApp(serverApp)) {
    serverApp.all('*', async (req, res, next) => {
      try {
        await gasketRoot.exec('nextPreHandling', { req, res, nextServer });

        if (!res.headersSent) {
          nextHandler(req, res);
        }
      } catch (err) {
        return next(err);
      }
    });
  } else if (isFastifyApp(serverApp)) {
    serverApp.route({
      method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      url: '*',
      handler: async (req, res) => {
        await gasketRoot.exec('nextPreHandling', {
          req: req.raw,
          res: res.raw,
          nextServer
        });

        if (!res.raw.headersSent) {
          nextHandler(req.raw, res.raw);
        }
      }
    });
  } else {
    throw new Error('Unsupported server type passed to setupNextHandling');
  }
}

export { setupNextApp, setupNextHandling };
