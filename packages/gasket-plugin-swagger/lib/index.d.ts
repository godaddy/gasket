import type { Application, Handler } from 'express';
import type { Options } from 'swagger-jsdoc'
import type { SwaggerUiOptions } from 'swagger-ui-express';
import type { FastifyInstance, RouteHandler } from 'fastify';
import type { MaybeAsync, MaybeMultiple } from '@gasket/engine';

export interface GasketSwaggerConfig {
  /** Target swagger spec file, either json or yaml. (Default:
   * 'swagger.json') */
  definitionFile?: string,

  /** Route to Swagger UI (Default: '/api-docs') */
  apiDocsRoute?: string,

  /** If set, the definitionFile will be generated based on JSDocs in the
   * configured files. See the swagger-jsdocs options for what is
   * supported. */
  jsdoc?: Options,

  /** Optional custom UI options. See swagger-ui-express options for what is
   * supported. */
  ui?: SwaggerUiOptions
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    swagger?: GasketSwaggerConfig
  }

  export interface HookExecTypes {
    swaggerExpressMiddleware(
      app: Application
    ): MaybeAsync<MaybeMultiple<Handler>>,
    swaggerFastifyPreHandler(
      fastify: FastifyInstance
    ): MaybeAsync<MaybeMultiple<RouteHandler>>
  }
}
