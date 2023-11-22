const loadSwaggerSpec = require('./load-spec');

/**
 * Serve the Swagger Docs UI.
 *
 * @param {object} gasket - Gasket API
 * @param {object} app - Fastify app instance
 * @async
 */
module.exports = {
  timing: {
    before: ['@gasket/plugin-nextjs']
  },
  handler: async function fastify(gasket, app) {
    const { swagger, root } = gasket.config;
    const { ui = {}, apiDocsRoute, definitionFile } = swagger;

    const [swaggerSpec, preHandlers] = await Promise.all([
      loadSwaggerSpec(root, definitionFile, gasket.logger),
      gasket.exec('swaggerFastifyPreHandler', app)
    ]);

    app.register(require('@fastify/swagger'), {
      prefix: apiDocsRoute,
      swagger: swaggerSpec,
      uiConfig: ui,
      preHandler: preHandlers.flat()
    });
  }
};
