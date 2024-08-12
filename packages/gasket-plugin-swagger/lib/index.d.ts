import type { Options } from 'swagger-jsdoc'
import type { SwaggerUiOptions } from 'swagger-ui-express';

type SwaggerOptions = {
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

declare module '@gasket/core' {
  export interface GasketConfig {
    swagger?: SwaggerOptions
  }
}

type BsdOptions = {
  root?: string,
  swagger?: SwaggerOptions
}

export function buildSwaggerDefinition(gasket: Gasket, options?: BsdOptions) : Promise<void>;

declare module 'create-gasket-app' {
  export interface CreateContext {
    hasSwaggerPlugin?: boolean;
  }
}

export default {
  name: '@gasket/plugin-swagger',
  version: '',
  description: '',
  hooks: {}
};
