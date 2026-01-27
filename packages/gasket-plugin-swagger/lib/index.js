/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/plugin-command" />


import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import buildSwaggerDefinition from './build-swagger-definition.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');
const isYaml = /\.ya?ml$/;

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
      await access(target);
      if (isYaml.test(definitionFile)) {
        const content = await readFile(target, 'utf8');
        const yaml = await import('js-yaml');
        __swaggerSpec = yaml.default.safeLoad(content);
      } else {
        __swaggerSpec = require(target);
      }
    } catch {
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
      await buildSwaggerDefinition(gasket, {});
    },
    express: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function express(gasket, app) {
        const swaggerUi = await import('swagger-ui-express');
        const { swagger, root } = gasket.config;
        const { ui = {}, apiDocsRoute, definitionFile } = swagger;

        const swaggerSpec = await loadSwaggerSpec(
          root,
          definitionFile,
          gasket.logger
        );

        app.use(
          apiDocsRoute,
          swaggerUi.default.serve,
          swaggerUi.default.setup(swaggerSpec, ui)
        );
      }
    },
    fastify: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function fastify(gasket, app) {
        const { swagger, root } = gasket.config;
        const { uiOptions = {}, apiDocsRoute = '/api-docs', definitionFile } = swagger;

        const swaggerSpec = await loadSwaggerSpec(
          root,
          definitionFile,
          gasket.logger
        );

        const fastifySwagger = await import('@fastify/swagger');
        const fastifySwaggerUi = await import('@fastify/swagger-ui');

        await app.register(fastifySwagger.default, {
          swagger: swaggerSpec
        });

        await app.register(fastifySwaggerUi.default, {
          routePrefix: apiDocsRoute,
          ...uiOptions
        });
      }
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

export default plugin;
