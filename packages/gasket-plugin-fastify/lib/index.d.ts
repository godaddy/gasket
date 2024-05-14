import type { MaybeAsync, MaybeMultiple } from '@gasket/core';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module '@gasket/core' {
  export interface GasketConfig {
    compression?: boolean,
    excludedRoutesRegex?: RegExp
  }

  // The middie middleware is added for express compatibility
  type Handler = (
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;
  type ErrorHandler = (
    error: Error,
    req: FastifyRequest,
    res: FastifyReply,
    next: (error?: Error) => void
  ) => void;

  export interface HookExecTypes {
    middleware(fastify: FastifyInstance): MaybeAsync<MaybeMultiple<Handler>>,
    fastify(fastify: FastifyInstance): MaybeAsync<void>,
    errorMiddleware(fastify: FastifyInstance): MaybeAsync<MaybeMultiple<ErrorHandler>>
  }
}
