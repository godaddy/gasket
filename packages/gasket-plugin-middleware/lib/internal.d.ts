import type { Application as ExpressApp, Request as ExpressRequest } from 'express';
import type { Logger } from '@gasket/plugin-logger';
import type { IncomingMessage, ServerResponse } from 'http';
import type { FastifyInstance, FastifyTypeProviderDefault, FastifyBaseLogger, RawServerDefault } from 'fastify';
import type { Gasket } from '@gasket/engine';

/** Type alias for Fastify application with HTTP/2 support */
type FastifyApp = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

declare module 'express' {
  interface Request {
    logger: Logger & {
      metadata?: (metadata: Record<string, any>) => void;
    };
  }
}

/**
 * Applies the cookie parser based on the middleware pattern.
 */
export function applyCookieParser(app: FastifyApp | ExpressApp, middlewarePattern: RegExp): void;

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
export function executeMiddlewareLifecycle(gasket: Gasket, app: ExpressApp | FastifyApp, middlewarePattern: RegExp): void;

/**
 * Attaches a log enhancer to the Express Request object.
 */
export function attachLogEnhancer(req: ExpressRequest): void;
