/// <reference types="@gasket/core" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-command" />


import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import buildSwaggerDefinition from './build-swagger-definition.js';
import postCreate from './post-create.js';
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
        mode: swagger.mode || 'static',
        definitionFile: swagger.definitionFile || 'swagger.json',
        apiDocsRoute: swagger.apiDocsRoute || '/api-docs'
      };
      return baseConfig;
    },
    async build(gasket) {
      const { swagger = {} } = gasket.config;
      if (swagger.mode !== 'introspect') {
        await buildSwaggerDefinition(gasket, {});
      }
    },
    express: {
      timing: {
        before: ['@gasket/plugin-nextjs']
      },
      handler: async function express(gasket, app) {
        const { swagger, root } = gasket.config;

        if (swagger.mode === 'introspect') {
          gasket.logger.warn(
            'swagger.mode "introspect" is only supported with Fastify. ' +
            'Skipping Swagger UI for Express. To use Swagger with Express, use mode "static".'
          );
          return;
        }

        if (swagger.spec) {
          gasket.logger.warn(
            'swagger.spec is only used when swagger.mode is "introspect". ' +
            'It has no effect in static mode.'
          );
        }

        const swaggerUi = await import('swagger-ui-express');
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
        first: true
      },
      // eslint-disable-next-line max-statements
      handler: async function fastify(gasket, app) {
        const { swagger } = gasket.config;
        const { uiOptions = {}, apiDocsRoute = '/api-docs' } = swagger;

        const fastifySwagger = await import('@fastify/swagger');
        const fastifySwaggerUi = await import('@fastify/swagger-ui');

        if (swagger.spec && swagger.mode !== 'introspect') {
          gasket.logger.warn(
            'swagger.spec is only used when swagger.mode is "introspect". ' +
            'It has no effect in static mode.'
          );
        }

        if (swagger.mode === 'introspect') {
          // Introspect: @fastify/swagger discovers routes via onRoute hook.
          // swagger.spec provides base metadata (info, security, etc.) but no file is loaded.
          // Defaults to OpenAPI 3.x; set spec.swagger to produce Swagger 2.0 output instead.
          if (swagger.jsdoc) {
            gasket.logger.warn(
              'swagger.jsdoc is ignored when swagger.mode is "introspect". ' +
              'Route introspection discovers routes automatically.'
            );
          }
          const spec = swagger.spec ?? {};
          const specKey = spec.swagger ? 'swagger' : 'openapi';
          await app.register(fastifySwagger.default, { [specKey]: spec });
        } else {
          // Static: load the pre-built definition file and serve it as-is.
          // Format auto-detected from file content: openapi key → 3.x, otherwise Swagger 2.0.
          const { root } = gasket.config;
          const { definitionFile } = swagger;
          const swaggerSpec = await loadSwaggerSpec(root, definitionFile, gasket.logger);
          const specKey = swaggerSpec?.openapi ? 'openapi' : 'swagger';
          await app.register(fastifySwagger.default, { [specKey]: swaggerSpec });
        }

        await app.register(fastifySwaggerUi.default, {
          routePrefix: apiDocsRoute,
          ...uiOptions
        });
      }
    },
    create(gasket, context) {
      context.useSwagger = true;

      context.pkg.add('dependencies', {
        [name]: `^${version}`
      });

      // Only write build scripts if not TypeScript
      if (!context.typescript) {
        context.pkg.add('scripts', {
          build: 'node gasket.js build'
        });
      }

      context.gasketConfig.addPlugin('pluginSwagger', '@gasket/plugin-swagger');
      context.gasketConfig.add('swagger', {
        jsdoc: {
          definition: {
            info: {
              title: context.appName,
              version: '0.0.0'
            }
          },
          apis: [
            './routes/*',
            './plugins/*'
          ]
        }
      });

      context.readme
        .subHeading('Definitions')
        .content('Use `@swagger` JSDocs to automatically generate the [swagger.json] spec file. Visit [swagger-jsdoc] for examples.')
        .link('swagger-jsdoc', 'https://github.com/Surnet/swagger-jsdoc/')
        .link('swagger.json', '/swagger.json');
    },
    postCreate,
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
          },
          {
            name: 'swagger.mode',
            link: 'README.md#configuration',
            description:
              'Set to "introspect" to enable Fastify route introspection. ' +
              'Defaults to "static" for backward compatibility.',
            type: 'string',
            default: 'static'
          },
          {
            name: 'swagger.spec',
            link: 'README.md#configuration',
            description:
              'Base metadata for introspect mode. Ignored in static mode. ' +
              'Format auto-detected: spec.swagger present means Swagger 2.0; otherwise OpenAPI 3.x.',
            type: 'object'
          }
        ]
      };
    }
  }
};

export default plugin;
