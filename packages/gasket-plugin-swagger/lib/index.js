/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-command" />


const path = require('path');
const fs = require('fs');
const { readFile, writeFile, access } = require('fs').promises;
const swaggerJSDoc = require('swagger-jsdoc');
const isYaml = /\.ya?ml$/;
const { name, version, description } = require('../package.json');

let __swaggerSpec;

/**
 * Load the the Swagger spec, only once.
 * @param {string} root - App root
 * @param {string} definitionFile - Path to file relative to root
 * @param {*} logger - gasket logger
 * @returns {Promise<object>} spec
 */
async function loadSwaggerSpec(root, definitionFile, logger) {
  if (!__swaggerSpec) {
    const target = path.join(root, definitionFile);

    try {
      await access(target, fs.constants.F_OK);
      if (isYaml.test(definitionFile)) {
        const content = await readFile(target, 'utf8');
        __swaggerSpec = require('js-yaml').safeLoad(content);
      } else {
        __swaggerSpec = require(target);
      }
    } catch (err) {
      logger.error(`Missing ${definitionFile} file...`);
    }
  }
  return __swaggerSpec;
}

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    configure(gasket, baseConfig) {
      const { swagger = {} } = baseConfig;

      baseConfig.swagger = {
        ...swagger,
        definitionFile: swagger.definitionFile || 'swagger.json',
        apiDocsRoute: swagger.apiDocsRoute || '/api-docs'
      };
      return baseConfig;
    },
    async build(gasket) {
      const { swagger, root } = gasket.config;
      const { jsdoc, definitionFile } = swagger;

      if (jsdoc) {
        const target = path.join(root, definitionFile);
        const swaggerSpec = swaggerJSDoc(jsdoc);

        if (!swaggerSpec) {
          gasket.logger.warn(
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
    express: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function express(gasket, app) {
        const swaggerUi = require('swagger-ui-express');
        const { swagger, root } = gasket.config;
        const { ui = {}, apiDocsRoute, definitionFile } = swagger;

        const swaggerSpec = await loadSwaggerSpec(
          root,
          definitionFile,
          gasket.logger
        );

        app.use(
          apiDocsRoute,
          swaggerUi.serve,
          swaggerUi.setup(swaggerSpec, ui)
        );
      }
    },
    fastify: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function fastify(gasket, app) {
        const { swagger, root } = gasket.config;
        const { ui = {}, apiDocsRoute, definitionFile } = swagger;

        const swaggerSpec = await loadSwaggerSpec(
          root,
          definitionFile,
          gasket.logger
        );

        // @ts-ignore
        app.register(require('@fastify/swagger'), {
          prefix: apiDocsRoute,
          swagger: swaggerSpec,
          uiConfig: ui
        });
      }
    },
    create(gasket, context) {
      context.hasSwaggerPlugin = true;

      context.pkg.add('dependencies', {
        [name]: `^${version}`
      });

      context.pkg.add('scripts', {
        prebuild: 'node gasket.js build'
      });

      context.gasketConfig.addPlugin('pluginSwagger', '@gasket/plugin-swagger');
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
        configurations: [
          {
            name: 'swagger',
            link: 'README.md#configuration',
            description: 'Swagger config object',
            type: 'object'
          },
          {
            name: 'swagger.definitionFile',
            link: 'README.md#configuration',
            description: 'Target swagger spec file, either json or yaml',
            type: 'string',
            default: 'swagger.json'
          },
          {
            name: 'swagger.apiDocsRoute',
            link: 'README.md#configuration',
            description: 'Route to Swagger UI',
            type: 'string',
            default: '/api-docs'
          },
          {
            name: 'swagger.jsdoc',
            link: 'README.md#configuration',
            description:
              'If set, the definitionFile will be generated based on JSDocs in the configured files',
            type: 'object'
          },
          {
            name: 'swagger.ui',
            link: 'README.md#configuration',
            description: 'Optional custom UI options',
            type: 'object'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
