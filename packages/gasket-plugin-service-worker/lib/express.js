/// <reference types="@gasket/plugin-express" />

const { getSWConfig } = require('./utils');
const configureEndpoint = require('./configure-endpoint');
/**
 * Express lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/engine').HookHandler<'express'>}
 */
module.exports = async function express(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
