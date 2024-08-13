import type { Plugin } from '@gasket/core';
import type { Options } from 'swagger-jsdoc'
import type { SwaggerUiOptions } from 'swagger-ui-express';
import type { FastifySwaggerUiConfigOptions, FastifySwaggerUiOptions } from '@fastify/swagger-ui';

declare module '@gasket/core' {
  export interface GasketConfig {
    swagger?: {
      /** Target swagger spec file, either json or yaml. (Default:
       * 'swagger.json') */
      definitionFile?: string,

      /** Route to Swagger UI (Default: '/api-docs') */
      apiDocsRoute?: string,

      /** If set, the definitionFile will be generated based on JSDocs in the
       * configured files. See the swagger-jsdocs options for what is
       * supported. */
      jsdoc?: Options,

      /** Optional custom UI options (Express Only). See swagger-ui-express options for what is
       * supported. */
      ui?: SwaggerUiOptions

      /** Optional custom UI options (Fastify Only). See @fastify/swagger-ui options for what is
       * supported. */
      uiOptions?: FastifySwaggerUiOptions
    }
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    hasSwaggerPlugin?: boolean;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-swagger',
  hooks: {}
};

export = plugin;
