/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Application as ExpressApp, Request as ExpressRequest } from 'express';
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
import type { Gasket, Plugin, MaybeMultiple } from '@gasket/core';
import type { Handler } from './index';

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
  app: FastifyApp | ExpressApp,
  middlewarePattern: RegExp
): void;

/**
 * Applies compression to the application if a compression config is present.
 */
export function applyCompression(
  app: ExpressApp | FastifyApp,
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
export function applyMiddlewareConfig(middleware: MaybeMultiple<Handler>, plugin: Plugin, middlewareConfig, middlewarePattern: RegExp): void;
export function applyMiddlewaresToApp(app, middlewares: MaybeMultiple<Handler>, middlewarePattern: RegExp): void;
