import type { Plugin, MaybeAsync, MaybeMultiple, Gasket } from '@gasket/core';
import type { FastifyInstance } from 'fastify';
import type { Application as ExpressApplication, Request, Response, NextFunction } from 'express';

export function http2Patch(req: Request, res: Response & {
  _implicitHeader?: () => void;
}, next: NextFunction): void;

declare module 'fastify' {
  interface FastifyReply {
    locals: Record<string, any>;
  }
}

declare module '@gasket/plugin-fastify' {
  interface FastifyConfig {
    /** Filter for which request URLs invoke Gasket middleware */
    middlewareInclusionRegex?: RegExp;
    /** @deprecated */
    excludedRoutesRegex?: RegExp;
  }
}

declare module '@gasket/plugin-express' {
  interface ExpressConfig {
    /** Filter for which request URLs invoke Gasket middleware */
    middlewareInclusionRegex?: RegExp;
    /** @deprecated */
    excludedRoutesRegex?: RegExp;
  }
}

export type Handler = (
  req: any,
  res: any,
  // Need more than Error to be compatible with express handlers
  next: (error?: Error | string | 'route' | 'router') => void
) => void;

type App = FastifyInstance | ExpressApplication;

declare module '@gasket/core' {
  export interface HookExecTypes {
    middleware(gasket: Gasket, app: App): MaybeAsync<MaybeMultiple<Handler>>;
  }

  export interface GasketConfig {
    compression?: boolean;
    /** Middleware configuration */
    middleware?: {
      /** Plugin name */
      plugin: string;
      /** Paths for middleware */
      paths?: (string | RegExp)[];
    }[];

    http2?: object;
  }
}

declare const plugin: Plugin;
export default plugin;
