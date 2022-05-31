const { getIntlConfig } = require('./configure');
const serveStaticMw = require('serve-static');

/**
 * Express lifecycle to set up route for serving locales
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} app - Fastify app
 */
module.exports = function fastify(gasket, app) {
  const { localesDir, serveStatic, defaultPath } = getIntlConfig(gasket);

  if (serveStatic) {
    const staticPath = serveStatic === true ? defaultPath : serveStatic;

    app.use(
      staticPath,
      serveStaticMw(localesDir, {
        index: false,
        maxAge: '1y',
        immutable: true
      })
    );
  }
};
