const { getSWConfig } = require('./utils');
const configureEndpoint = require('./configure-endpoint');

/**
 * Fastify lifecycle to add an endpoint to serve service worker script
 *
 * @param {Gasket} gasket - Gasket
 * @param {Fastify} app - App
 */
module.exports = async function fastify(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
