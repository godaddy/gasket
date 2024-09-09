import type { Application as ExpressApp, Request } from 'express';
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
import type { Gasket } from '@gasket/engine';

/** Type alias for Fastify application with HTTP/2 support */
type FastifyApp<
  Server = Http2SecureServer,
  Request = Http2ServerRequest,
  Response = Http2ServerResponse
> = FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;;

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
function applyCookieParser(
  app: FastifyApp | ExpressApp,
  middlewarePattern: RegExp
): void;

/**
 * Applies compression to the application if a compression config is present.
 */
function applyCompression(
  app: ExpressApp | FastifyApp,
  /** Boolean indicating if compression should be applied. */
  compressionConfig: boolean
): void;

/**
 * Executes the middleware lifecycle for the application.
 */
function executeMiddlewareLifecycle(
  gasket: Gasket,
  app: ExpressApp | FastifyApp,
  middlewarePattern: RegExp
): void;

/**
 * Attaches a log enhancer to the Express Request object.
 */
function attachLogEnhancer(req: Request): void;
