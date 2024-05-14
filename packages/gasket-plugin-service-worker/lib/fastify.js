/// <reference types="@gasket/plugin-fastify" />

const { getSWConfig } = require('./utils/utils');
const configureEndpoint = require('./utils/configure-endpoint');

/**
 * Fastify lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/engine').HookHandler<'fastify'>}
 */
module.exports = async function fastify(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);

  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
