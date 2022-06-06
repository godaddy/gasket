const { getIntlConfig } = require('./configure');
const serveStaticMw = require('serve-static');

/**
 * Express/Fastify lifecycle to set up route for serving locales
 *
 * @param {Gasket} gasket - Gasket
 * @param {Object} app - Express/Fastify app
 */
module.exports = function serve(gasket, app) {
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
