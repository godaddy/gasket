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
  const { outputDir: defaultOutputDir, serveStatic } = getIntlConfig(gasket);

  if (serveStatic) {
    let outputDir = '';
    if (serveStatic === true) {
      outputDir = defaultOutputDir;
    } else {
      outputDir = serveStatic;
    }

    app.use('/_locales', serveStaticMw(path.join(root, outputDir), {
      index: false,
      maxAge: '1y',
      immutable: true
    }));
  }
};
