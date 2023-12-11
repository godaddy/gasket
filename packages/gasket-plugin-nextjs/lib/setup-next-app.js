import { createConfig } from './config.js';

/**
 * Provide port defaults
 *
 * @param {String} env env property from gasket config
 * @returns {Number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Small helper function that creates nextjs app from the gasket
 * configuration.
 *
 * @param   {Gasket}  gasket                The gasket API.
 * @returns {NextServer} The Nextjs App
 * @private
 */
export async function setupNextApp(gasket) {
  const { exec, command, config } = gasket;
  const { hostname, http, https, http2, env } = config;
  const createNextApp = require('next');
  const devServer = (command.id || command) === 'local';

  const _http = http || https || http2;
  const port = (_http && _http.port) || _http || getPortFallback(env);

  const app = createNextApp({
    dev: devServer,
    conf: await createConfig(gasket, devServer),
    hostname,
    port
  });

  //
  // We need to call the `next` lifecycle before we prepare the application
  // as the prepare step initializes all the routes that a next app can have.
  // If we wait later, it's possible that our added routes/pages are not
  // recognized.
  //
  await exec('next', app);
  await app.prepare();

  return app;
}

/**
 * Sets up the next.js request handler to be called after all other middleware
 * @param {NextServer} nextServer - The Next.js server instance
 * @param {any} serverApp - The express server app
 * @param {any} gasket - The Gasket object
 */
export function setupNextHandling(nextServer, serverApp, gasket) {
  const nextHandler = nextServer.getRequestHandler();
  serverApp.all('*', async (req, res, next) => {
    try {
      await gasket.exec('nextPreHandling', { req, res, nextServer });
      nextHandler(req, res);
    } catch (err) {
      return next(err);
    }
  });
}
