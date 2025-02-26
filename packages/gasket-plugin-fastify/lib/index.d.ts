import type { MaybeAsync, MaybeMultiple, Plugin } from '@gasket/core';
import type { Logger } from '@gasket/plugin-logger';
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyServerOptions,
  FastifyBaseLogger,
  FastifyTypeProviderDefault,
  RawServerDefault
} from 'fastify';
import type { IncomingMessage, ServerResponse } from 'http';

declare module '@gasket/core' {
  export interface GasketActions {
    /** @deprecated */
    getFastifyApp(): FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;
  }

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
      /** Fastify request logging per route */
      disableRequestLogging?: boolean;
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
      app: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>
    ): MaybeAsync<MaybeMultiple<Handler> & { paths?: (string | RegExp)[] }>;
    fastify(app: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>): MaybeAsync<void>;
    errorMiddleware(): MaybeAsync<MaybeMultiple<ErrorHandler>>;
  }
}

export function alignLogger(
  logger: Logger
): FastifyBaseLogger

declare module 'create-gasket-app' {
  export interface CreateContext {
    /** Flag indicating if API app is enabled */
    apiApp?: boolean;
    addApiRoutes?: boolean;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-fastify',
  hooks: {}
};

export = plugin;
