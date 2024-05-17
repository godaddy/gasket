import type { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';
import type { Request, Response } from 'express';
import type { Options } from 'lru-cache';
import type { MinifyOptions } from 'uglify-js';
import type { MaybeAsync, MaybeMultiple } from '@gasket/core';

export interface ServiceWorkerConfig {
  /** Name the service worker file. Default is /sw.js */
  url?: string;

  /** From where to intercept requests. Default is / */
  scope?: string;

  /** The JavaScript content to be served. While this can be initialized in
   * the Gasket config, the expectation is it will be modified by plugins
   * using composeServiceWorker lifecycle. */
  content?: string;

  /** Optional cache key functions that accept the request object as
   * argument and return a string. */
  cacheKeys?: Array<(request: IncomingMessage) => string>;

  /** adjust the content cache settings using the lru-cache options. By
   * default, content will remained cached for 5 days from last request. */
  cache?: Options<string, string>;

  /** Minification options to be used on the composed JavaScript.
   * Configuration for this field is passed directly to uglify-js. This is
   * turned on in production by default. Adding minify: { } will turn on the
   * default behavior in other environments, if specified. */
  minify?: MinifyOptions | boolean;

  /** By default, a service worker registration script will be injected to
   * the webpack entry modules. This can be disabled by setting this to
   * false. If you wish to control which entry modules get injected, read
   * more in the registering section. */
  webpackRegister?:
    | boolean
    | MaybeMultiple<string>
    | ((key: string) => boolean);

  /** If true, a static sw.js will be output to the ./public dir. Otherwise,
   * this can be set to a string with a path to an alternate output
   * location. This disables request-based service workers. Default is
   * false. */
  staticOutput?: string | boolean;
}

declare module '@gasket/core' {
  export interface GasketConfig {
    serviceWorker?: ServiceWorkerConfig;
  }

  export interface HookExecTypes {
    composeServiceWorker(
      content: string,
      context: { req: Request; res: Response }
    ): MaybeAsync<string>;

    serviceWorkerCacheKey(): MaybeAsync<
      (req: Request, res: Response) => string
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

declare module 'express' {
  interface Response {
    locals?: ServiceWorkerLocals;
  }
}

async function sw(req: Request, res: Response): Promise<void>;

export async function configureEndpoint(gasket: Gasket): sw;

export async function serviceWorkerMiddleware(
  req: Request & {
    swRegisterScript: string;
  },
  res: Response,
  next: (err?: any) => void
): Promise<void>;

/** Get the service worker configuration from the gasket config */
export function getSWConfig(gasket: Gasket): ServiceWorkerConfig;

/** Gathers thunks to key caches of composed sw scripts, based on req */
export async function getCacheKeys(
  gasket: Gasket
): Promise<Array<(req: Request, res: Response) => string>>;

export async function getComposedContent(
  gasket: Gasket,
  context: { req: Request; res: Response } | {}
): string;

export async function loadRegisterScript(config: ServiceWorkerConfig): string;
