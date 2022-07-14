const serveStatic = require('serve-static');
const { getOutputDir } = require('./utils');

/**
 * Express lifecycle to set up route for serving workbox libraries
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} app - Fastify app
 */
module.exports = function fastify(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.register(serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }), { prefix: '/_workbox' });
};
