import type { MaybeAsync, MaybeMultiple } from '@gasket/engine';
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyServerOptions
} from 'fastify';

declare module '@gasket/engine' {
  export interface GasketConfig {
    fastify?: {
      /** Enable compression */
      compression?: boolean;
      /** Regular expression for excluded routes */
      excludedRoutesRegex?: RegExp;
      /** Trust proxy configuration */
      trustProxy?: FastifyServerOptions['trustProxy'];
      /** Glob pattern for source files setting up fastify routes */
      routes?: string;
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
  type Handler = (
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;

  /** Error handler function type */
  type ErrorHandler = (
    error: Error,
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;

  export interface HookExecTypes {
    middleware(
      fastify: FastifyInstance
    ): MaybeAsync<MaybeMultiple<Handler> & { paths?: (string | RegExp)[] }>;
    fastify(fastify: FastifyInstance): MaybeAsync<void>;
    errorMiddleware(): MaybeAsync<MaybeMultiple<ErrorHandler>>;
  }
}

declare module '@gasket/cli' {
  export interface CreateContext {
    /** Flag indicating if API app is enabled */
    apiApp?: boolean;
  }
}
