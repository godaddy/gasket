const { getSWConfig } = require('./utils');
const configureEndpoint = require('./configure-endpoint');
/**
 * Express lifecycle to add an endpoint to serve service worker script
 *
 * @param {Gasket} gasket - Gasket
 * @param {Express} app - App
 */
module.exports = async function express(gasket, app) {
  const { staticOutput, url } = getSWConfig(gasket);
  if (staticOutput) return;
  app.get(url, await configureEndpoint(gasket));
};
