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

export interface FastifyConfig {
  /** Trust proxy configuration */
  trustProxy?: FastifyServerOptions['trustProxy'];
  /** Fastify request logging per route */
  disableRequestLogging?: boolean;
}

export type FastifyOptions = FastifyServerOptions & {
  https?: any,
  http2?: boolean | object
}

declare module '@gasket/core' {
  export interface GasketActions {
    /** @deprecated */
    getFastifyApp(): FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;
  }

  export interface GasketConfig {
    fastify?: FastifyConfig
  }


  /** Error handler function type */
  type ErrorHandler = (
    error: Error,
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;

  export interface HookExecTypes {
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

declare const plugin: Plugin;

export default plugin;
