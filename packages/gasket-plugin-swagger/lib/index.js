const path = require('path');
const fs = require('fs');
const { readFile, writeFile, access } = require('fs').promises;
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const isYaml = /\.ya?ml$/;

let __swaggerSpec;

/**
 * Load the the Swagger spec, only once.
 *
 * @param {string} root - App root
 * @param {string} definitionFile - Path to file relative to root
 * @param {*} logger - gasket logger
 * @returns {Promise<object>} spec
 */
async function loadSwaggerSpec(root, definitionFile, logger) {
  if (!__swaggerSpec) {
    const target = path.join(root, definitionFile);

    await access(target, fs.constants.F_OK)
      .then(async () => {
        if (isYaml.test(definitionFile)) {
          const content = await readFile(target, 'utf8');
          // eslint-disable-next-line require-atomic-updates
          __swaggerSpec = require('js-yaml').safeLoad(content);
        } else {
          __swaggerSpec = require(target);
        }
      })
      .catch(() => {
        logger.error(`Missing ${definitionFile} file...`);
        return;
      });
  }
  return __swaggerSpec;
}

module.exports = {
  name: require('../package').name,
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

        if (!swaggerSpec) {
          gasket.logger.warning(
            `No JSDocs for Swagger were found in files (${jsdoc.apis}). Definition file not generated...`
          );
        } else {
          let content;
          if (isYaml.test(definitionFile)) {
            content = require('js-yaml').safeDump(swaggerSpec);
          } else {
            content = JSON.stringify(swaggerSpec, null, 2);
          }

          await writeFile(target, content, 'utf8');
          gasket.logger.info(`Wrote: ${definitionFile}`);
        }
      }
    },
    /**
     * Serve the Swagger Docs UI.
     *
     * @param {object} gasket - Gasket API
     * @param {object} app - Express app instance
     * @async
     */
    express: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function express(gasket, app) {
        const { swagger, root } = gasket.config;
        const { ui = {}, apiDocsRoute, definitionFile } = swagger;

        const swaggerSpec = await loadSwaggerSpec(root, definitionFile, gasket.logger);

        app.use(apiDocsRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec, ui));
      }
    },
    /**
     * Sets swagger plugin prop to true and adds swagger config to gasket.config
     *
     * @param {object} gasket - Gasket API
     * @param {CreateContext} context - Create context
     *
     */
    create(gasket, context) {
      context.hasSwaggerPlugin = true;
      context.gasketConfig.add('swagger', {
        jsdoc: {
          definition: {
            info: {
              title: context.appName,
              version: '1.0.0'
            }
          },
          apis: ['./routes/*']
        }
      });
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [{
          name: 'swagger',
          link: 'README.md#configuration',
          description: 'The base gasket.config object',
          type: 'object'
        }, {
          name: 'swagger.definitionFile',
          link: 'README.md#configuration',
          description: 'Target swagger spec file, either json or yaml',
          type: 'string',
          default: 'swagger.json'
        }, {
          name: 'swagger.apiDocsRoute',
          link: 'README.md#configuration',
          description: 'Route to Swagger UI',
          type: 'string',
          default: '/api-docs'
        }, {
          name: 'swagger.jsdoc',
          link: 'README.md#configuration',
          description: 'If set, the definitionFile will be generated based on JSDocs in the configured files',
          type: 'object'
        }, {
          name: 'swagger.ui',
          link: 'README.md#configuration',
          description: 'Optional custom UI options',
          type: 'object'
        }]
      };
    }
  }
};
