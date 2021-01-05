const path = require('path');
const { getIntlConfig } = require('./configure');
const serveStaticMw = require('serve-static');

/**
 * Express lifecycle to set up route for serving locales
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} app - Express app
 */
module.exports = function express(gasket, app) {
  const { root } = gasket.config;
  const { outputDir, serveStatic, defaultPath } = getIntlConfig(gasket);

  if (serveStatic) {
    const staticPath = serveStatic === true ? defaultPath : serveStatic;

    app.use(staticPath, serveStaticMw(path.join(root, outputDir), {
      index: false,
      maxAge: '1y',
      immutable: true
    }));
  }
};
