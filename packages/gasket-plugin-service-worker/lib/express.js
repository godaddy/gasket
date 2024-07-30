/// <reference types="@gasket/plugin-express" />

const { getSWConfig } = require('./utils/utils');
const configureEndpoint = require('./utils/configure-endpoint');
/**
 * Express lifecycle to add an endpoint to serve service worker script
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
module.exports = async function express(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
