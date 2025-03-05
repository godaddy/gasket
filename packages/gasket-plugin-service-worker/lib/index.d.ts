import type { IncomingMessage } from 'http';
import type { Application, Request, Response } from 'express';
import type { FastifyRequest, FastifyReply, RouteHandlerMethod } from 'fastify';
import type { Options } from 'lru-cache';
import type { MinifyOptions } from 'uglify-js';
import type { MaybeAsync, MaybeMultiple, Plugin, Gasket, GasketConfig } from '@gasket/core';
import type { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2';

export interface ServiceWorkerConfig {
  /** Name the service worker file. Default is /sw.js */
  url?: string;

  /** From where to intercept requests. Default is / */
  scope?: string;

  /**
   * The JavaScript content to be served. While this can be initialized in
   * the Gasket config, the expectation is it will be modified by plugins
   * using composeServiceWorker lifecycle.
   */
  content?: string;

  /**
   * Optional cache key functions that accept the request object as
   * argument and return a string.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cacheKeys?: Array<(request: IncomingMessage) => string>;

  /**
   * adjust the content cache settings using the lru-cache options. By
   * default, content will remained cached for 5 days from last request.
   */
  cache?: Options<string, string>;

  /**
   * Minification options to be used on the composed JavaScript.
   * Configuration for this field is passed directly to uglify-js. This is
   * turned on in production by default. Adding minify: { } will turn on the
   * default behavior in other environments, if specified.
   */
  minify?: MinifyOptions | boolean;

  /**
   * By default, a service worker registration script will be injected to
   * the webpack entry modules. This can be disabled by setting this to
   * false. If you wish to control which entry modules get injected, read
   * more in the registering section.
   */
  webpackRegister?:
  | boolean
  | MaybeMultiple<string>
  | ((key: string) => boolean);

  /**
   * If true, a static sw.js will be output to the ./public dir. Otherwise,
   * this can be set to a string with a path to an alternate output
   * location. This disables request-based service workers. Default is
   * false.
   */
  staticOutput?: string | boolean;
}

declare module '@gasket/core' {

  export interface GasketActions {
    getSWRegisterScript(): MaybeAsync<string>;
  }

  export interface GasketConfig {
    serviceWorker?: ServiceWorkerConfig;
  }

  export interface HookExecTypes {
    composeServiceWorker(
      content: string,
      context: { req: Request; res: Response }
    ): MaybeAsync<string>;

    serviceWorkerCacheKey(): MaybeAsync<
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (req: Request, res: Response) => MaybeAsync<string>
    >;
  }
}

interface ServiceWorkerLocals {
  gasketData?: {
    intl?: {
      locale?: string;
    };
  };
}

declare module 'express-serve-static-core' {
  interface Response {
    locals?: ServiceWorkerLocals;
  }
}

export function configureEndpoint(gasket: Gasket):
  RouteHandlerMethod<Http2SecureServer, Http2ServerRequest, Http2ServerResponse> |
  Application<Record<string, any>>;

export function serviceWorkerMiddleware(
  req: Request & {
    swRegisterScript: string;
  },
  res: Response,
  next: (err?: any) => void
): Promise<void>;

/** Get the service worker configuration from the gasket config */
export function getSWConfig(param: {
  config: GasketConfig
}): ServiceWorkerConfig;

/** Gathers thunks to key caches of composed sw scripts, based on req */
export function getCacheKeys(
  gasket: Gasket
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
): Promise<Array<(req: Request | FastifyRequest, res: Response | FastifyReply) => MaybeAsync<string>>>;

export function getComposedContent(
  gasket: Gasket,
  context: { req: Request; res: Response }
): string;

export function loadRegisterScript(config: ServiceWorkerConfig): string;

declare const plugin: Plugin;

export default plugin;
