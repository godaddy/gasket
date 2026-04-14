import type { Plugin, Gasket } from '@gasket/core';
import type { Options } from 'swagger-jsdoc';
import type { SwaggerUiOptions } from 'swagger-ui-express';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import type { CreatePrompt, CreateContext } from 'create-gasket-app';

type SwaggerOptions = {
  /**
   * Target swagger spec file, either json or yaml. (Default:
   * 'swagger.json')
   */
  definitionFile?: string,

  /** Route to Swagger UI (Default: '/api-docs') */
  apiDocsRoute?: string,

  /**
   * If set, the definitionFile will be generated based on JSDocs in the
   * configured files. See the swagger-jsdocs options for what is
   * supported.
   */
  jsdoc?: Options,

  /**
   * Optional custom UI options. See swagger-ui-express options for what is
   * supported.
   */
  ui?: SwaggerUiOptions

  /**
   * Optional custom UI options (Fastify Only). See @fastify/swagger-ui options for what is
   * supported.
   */
  uiOptions?: FastifySwaggerUiOptions

  /**
   * When set, enables Fastify route introspection. The `@fastify/swagger` plugin discovers
   * routes automatically via its onRoute hook — no definition file is built or loaded.
   * The object provides base metadata (info, components, security, servers, etc.).
   * Format is auto-detected from content: if introspect.swagger is present, Swagger 2.0
   * output is produced; otherwise OpenAPI 3.x is used (the default).
   *
   * Use `routes` inside this object to filter which routes appear in the generated spec.
   * - `routes.include`: show only routes whose URL starts with one of these prefixes.
   * - `routes.exclude`: hide routes whose URL starts with one of these prefixes.
   * A route must satisfy both conditions when both are set.
   * @example
   * introspect: { routes: { include: ['/api/v1'] }, info: { ... } }
   * introspect: { routes: { exclude: ['/internal'] }, info: { ... } }
   */
  introspect?: {
    routes?: {
      include?: string[];
      exclude?: string[];
    };
    [key: string]: unknown;
  }

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

export function buildSwaggerDefinition(gasket: Gasket, options?: BsdOptions): Promise<void>;

declare module 'create-gasket-app' {
  export interface CreateContext {
    useSwagger?: boolean;
  }
}

/* Externalize Swagger prompts for preset */
export function promptSwagger(
  context: CreateContext,
  prompt: CreatePrompt
): Promise<CreateContext>

declare const plugin: Plugin;
export default plugin;
