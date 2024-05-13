/// <reference types="@gasket/plugin-https" />

const { createConfig } = require('./config');

/**
 * Provide port defaults
 * @param {string} env env property from gasket config
 * @returns {number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Small helper function that creates nextjs app from the gasket configuration.
 * @type {import('../internal').setupNextApp}
 */
async function setupNextApp(gasket) {
  const { command, config } = gasket;
  const { hostname, http, https, http2, env } = config;
  const createNextApp = require('next');
  const devServer = (command.id || command) === 'local';
  const _http = http || https || http2;
  // @ts-ignore - _http can be a number or an object
  const port = (_http && _http.port) || _http || getPortFallback(env);

  // @ts-ignore - createNextApp.default is not typed
  const app = createNextApp({
    dev: devServer,
    conf: await createConfig(gasket, devServer),
    hostname,
    port
  });

  // We need to call the `next` lifecycle before we prepare the application as
  // the prepare step initializes all the routes that a next app can have. If we
  // wait later, it's possible that our added routes/pages are not recognized.
  await gasket.exec('next', app);
  await app.prepare();

  return app;
}

/**
 * Sets up the next.js request handler to be called after all other middleware
 * @type {import('../internal').setupNextServer}
 */
function setupNextHandling(nextServer, serverApp, gasket) {
  const nextHandler = nextServer.getRequestHandler();

  serverApp.all('*', async (req, res, next) => {
    try {
      await gasket.exec('nextPreHandling', { req, res, nextServer });
      if (!res.headersSent) {
        nextHandler(req, res);
      }
    } catch (err) {
      return next(err);
    }
  });
}

module.exports = {
  setupNextApp,
  setupNextHandling
};
