const loadSwaggerSpec = require('./load-spec');

/**
 * Serve the Swagger Docs UI.
 *
 * @param {object} gasket - Gasket API
 * @param {object} app - Express app instance
 * @async
 */
module.exports = {
  timing: {
    before: ['@gasket/plugin-nextjs']
  },
  handler: async function express(gasket, app) {
    const swaggerUi = require('swagger-ui-express');
    const { swagger, root } = gasket.config;
    const { ui = {}, apiDocsRoute, definitionFile } = swagger;

    const [swaggerSpec, middleware] = await Promise.all([
      loadSwaggerSpec(root, definitionFile, gasket.logger),
      gasket.exec('swaggerExpressMiddleware', app)
    ]);

    if (!swaggerSpec) return;

    app.use(apiDocsRoute, [
      middleware,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, ui)
    ].flat());
  }
};
