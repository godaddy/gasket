/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Application as ExpressApp, Request as ExpressRequest, Handler } from 'express';
import type { Logger } from '@gasket/plugin-logger';
import type {
  Http2SecureServer,
  Http2ServerRequest,
  Http2ServerResponse
} from 'http2';
import type { IncomingMessage, ServerResponse } from 'http';
import type {
  FastifyInstance,
  FastifyTypeProviderDefault,
  FastifyBaseLogger,
  RawServerDefault
} from 'fastify';
import type { Gasket, Plugin, MaybeMultiple, MaybeAsync } from '@gasket/core';

/** Type alias for Fastify application with HTTP/2 support */
type FastifyApp<
  Server = Http2SecureServer,
  Request = Http2ServerRequest,
  Response = Http2ServerResponse
> = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

declare module 'express' {
  interface Request {
    logger: Logger & {
      metadata?: (metadata: Record<string, unknown>) => void;
    };
  }
}

/**
 * Applies the cookie parser based on the middleware pattern.
 */
export function applyCookieParser(
  app: ExpressApp,
  middlewarePattern?: RegExp
): void;

/**
 * Applies compression to the application if a compression config is present.
 */
export function applyCompression(
  app: ExpressApp,
  /** Boolean indicating if compression should be applied. */
  compressionConfig: boolean
): void;

/**
 * Executes the middleware lifecycle for the application.
 */
export function executeMiddlewareLifecycle(
  gasket: Gasket,
  app: ExpressApp | FastifyApp,
  middlewarePattern: RegExp
): Promise<void>;

/**
 * Attaches a log enhancer to the Express Request object.
 */
export function attachLogEnhancer(req: ExpressRequest): void;
export function isValidMiddleware(middleware: Function | Function[]): boolean;
export function applyMiddlewareConfig(
  middleware: Record<string, any>,
  plugin: Plugin,
  middlewareConfig: Array<{ plugin: string; paths?: any[] }>,
  middlewarePattern?: RegExp
): void;
export function applyMiddlewaresToApp(
  app: ExpressApp,
  middlewares: Array<{
    handler: Handler,
    paths?: string | RegExp | Array<string | RegExp>;
  }>,
  middlewarePattern?: RegExp
): void;
