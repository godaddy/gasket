const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const isYaml = /\.ya?ml$/;

let __swaggerSpec;

/**
 * Load the the Swagger spec, only once.
 *
 * @param {string} root - App root
 * @param {string} definitionFile - Path to file relative to root
 * @returns {Promise<object>} spec
 */
async function loadSwaggerSpec(root, definitionFile) {
  if (!__swaggerSpec) {

    const target = path.join(root, definitionFile);
    if (isYaml.test(definitionFile)) {
      const content = await readFile(target, 'utf8');
      __swaggerSpec = require('js-yaml').safeLoad(content);
    } else {
      __swaggerSpec = require(target);
    }
  }
  return __swaggerSpec;
}

module.exports = {
  name: require('./package').name,
  hooks: {
    /**
     * Configure swagger plugin defaults
     *
     * @param {object} gasket - Gasket API
     * @param {object} baseConfig - Config object to manipulate
     * @returns {object} config
     */
    configure(gasket, baseConfig) {
      const { swagger = {} } = baseConfig;

      baseConfig.swagger = {
        ...swagger,
        definitionFile: swagger.definitionFile || 'swagger.json',
        apiDocsRoute: swagger.apiDocsRoute || '/api-docs'
      };
      return baseConfig;
    },
    /**
     * Builds the swagger spec from JSDocs if configured.
     *
     * @param {object} gasket - Gasket API
     * @async
     */
    async build(gasket) {
      const { swagger, root } = gasket.config;
      const { jsdoc, definitionFile } = swagger;

      if (jsdoc) {
        const target = path.join(root, definitionFile);
        const swaggerSpec = swaggerJSDoc(jsdoc);

        let content;
        if (isYaml.test(definitionFile)) {
          content = require('js-yaml').safeDump(swaggerSpec);
        } else {
          content = JSON.stringify(swaggerSpec, null, 2);
        }

        await writeFile(target, content, 'utf8');
        gasket.logger.info(`Wrote: ${definitionFile}`);
      }
    },
    /**
     * Serve the Swagger Docs UI.
     *
     * @param {object} gasket - Gasket API
     * @param {object} app - Express app instance
     * @async
     */
    async express(gasket, app) {
      const { swagger, root } = gasket.config;
      const { ui = {}, apiDocsRoute, definitionFile } = swagger;

      const swaggerSpec = await loadSwaggerSpec(root, definitionFile);

      app.use(apiDocsRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec, ui));
    }
  }
};
