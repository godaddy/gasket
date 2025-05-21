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
 * Type guard to detect if the app is an Express app.
 */
export function canUseMiddleware(app: any): app is ExpressApp;

/**
 * Applies the cookie parser based on the middleware pattern.
 */
export function applyCookieParser(
  app: ExpressApp | FastifyApp,
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

/**
 * Checks whether a given value is a middleware object with a `handler` function.
 *
 * @param {any} value - The value to check
 * @returns {value is { handler: Handler; paths?: string | RegExp | Array<string | RegExp> }} True if the value is a middleware object
 */
export function isMiddlewareObject(value: any): value is { handler: Handler; paths?: string | RegExp | Array<string | RegExp> };

/**
 * Normalizes a middleware entry into a consistent `{ handler, paths }` format.
 * Accepts either a function, an object with a `handler`, or an invalid entry.
 *
 * @param {any} entry - The middleware entry to normalize
 * @returns {{ handler: Handler | undefined, paths?: string | RegExp | Array<string | RegExp> }}
 */
export function normalizeMiddlewareEntry(
  entry: any
): {
  handler: Handler | undefined;
  paths?: string | RegExp | Array<string | RegExp>;
};

/**
 * Applies a single middleware function to the app using either specific paths
 * or a fallback middleware pattern.
 *
 * @param {ExpressApp} app - The Express app instance
 * @param {Handler} handler - The middleware function to apply
 * @param {string | RegExp | Array<string | RegExp>} [paths] - Optional specific paths
 * @param {RegExp} [middlewarePattern] - Optional fallback pattern
 * @returns {void}
 */
export function applyMiddlewareToApp(
  app: ExpressApp,
  handler: Handler,
  paths?: string | RegExp | Array<string | RegExp>,
  middlewarePattern?: RegExp
): void;

export function applyMiddlewareConfig(
  middleware: Record<string, any>,
  plugin: Plugin,
  middlewareConfig: Array<{ plugin: string; paths?: any[] }>,
  middlewarePattern?: RegExp
): void;

/**
 * A single middleware entry.
 *
 * Can be either:
 * - A standard Express middleware function: `(req, res, next) => void`
 * - An object containing:
 *    - `handler`: the middleware function
 *    - `paths`: an optional path or list of paths where the middleware should apply
 */
type MiddlewareEntry =
  | Handler
  | {
    handler: Handler;
    paths?: string | RegExp | Array<string | RegExp>;
  };

/**
 * Attaches middleware layers to an Express app, using optional paths or a global pattern.
 * Handles various middleware formats: function, object with `handler`, or arrays of both.
 * @param {ExpressApp} app - The Express app to attach middleware to
 * @param {Array<MiddlewareEntry | MiddlewareEntry[]>} middlewares - A list of middleware layers to apply
 * @param {RegExp} [middlewarePattern] - A global fallback pattern to match routes if no paths are specified
 */
export function applyMiddlewaresToApp(
  app: ExpressApp,
  middlewares: Array<MiddlewareEntry | MiddlewareEntry[]>,
  middlewarePattern?: RegExp
): void;
