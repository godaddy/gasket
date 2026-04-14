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
   * Selects the documentation mode.
   * - "static" (default): serves a pre-built definition file (swagger.json / swagger.yaml).
   *   Compatible with both Express and Fastify. All existing apps use this mode automatically.
   * - "introspect": Fastify only. @fastify/swagger discovers routes automatically via its
   *   onRoute hook. No definition file is built or loaded.
   */
  mode?: 'static' | 'introspect'

  /**
   * Base metadata for introspect mode (info, components, security, servers, etc.).
   * Ignored when mode is "static".
   * Format is auto-detected from content: if spec.swagger is present, Swagger 2.0
   * output is produced; otherwise OpenAPI 3.x is used (the default).
   */
  spec?: Record<string, unknown>
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
