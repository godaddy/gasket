import type { MaybeAsync, MaybeMultiple, Plugin } from '@gasket/core';
import { Logger } from '@gasket/plugin-logger';
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyServerOptions
} from 'fastify';
import { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2'

export type AppRoutes = Array<MaybeAsync<(app: FastifyInstance) => void>>;

declare module '@gasket/core' {
  export interface GasketConfig {
    fastify?: {
      /** Enable compression */
      compression?: boolean;
      /** Filter for which request URLs invoke Gasket middleware */
      middlewareInclusionRegex?: RegExp;
      /** @deprecated */
      excludedRoutesRegex?: RegExp;
      /** Trust proxy configuration */
      trustProxy?: FastifyServerOptions['trustProxy'];
      /** Glob pattern for source files setting up fastify routes */
      routes?: Array<MaybeAsync<(app: FastifyInstance<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>) => void>>;
    };
    /** Middleware configuration */
    middleware?: {
      /** Plugin name */
      plugin: string;
      /** Paths for middleware */
      paths?: (string | RegExp)[];
    }[];
  }

  /**
   * Handler function type - The middie middleware is added for express
   * compatibility
   */
  type Handler = (req: any, res: any, next: (error?: Error) => void) => void;

  /** Error handler function type */
  type ErrorHandler = (
    error: Error,
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;

  export interface HookExecTypes {
    middleware(
      app: FastifyInstance<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>
    ): MaybeAsync<MaybeMultiple<Handler> & { paths?: (string | RegExp)[] }>;
    fastify(app: FastifyInstance<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>): MaybeAsync<void>;
    errorMiddleware(): MaybeAsync<MaybeMultiple<ErrorHandler>>;
  }
}

type FastifyLogger = Logger & {
  trace?: () => MaybeAsync<any>,
  fatal?: () => MaybeAsync<any>
}

export function alignLogger(
  logger: Logger
): FastifyLogger

declare module 'create-gasket-app' {
  export interface CreateContext {
    /** Flag indicating if API app is enabled */
    apiApp?: boolean;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-fastify',
  hooks: {}
};

export = plugin;
