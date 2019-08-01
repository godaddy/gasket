const serveStatic = require('serve-static');
const { getOutputDir } = require('./utils');

/**
 * Express lifecycle to set up route for serving workbox libraries
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} app - Express app
 */
module.exports = function express(gasket, app) {
  const outputDir = getOutputDir(gasket);

  app.use('/_workbox', serveStatic(outputDir, {
    index: false,
    maxAge: '1y',
    immutable: true
  }));
};
