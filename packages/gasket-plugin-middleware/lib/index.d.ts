import type { Plugin, MaybeAsync, MaybeMultiple, Gasket } from '@gasket/core';
import type { FastifyInstance } from 'fastify'
import type { Application as ExpressApplication } from 'express';

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

declare module 'express-serve-static-core' {
  interface Response {
    /*
     * This is a patch for the undocumented _implicitHeader used by the
     * compression middleware which is not present on the http2 request object.
     * @see: https://github.com/expressjs/compression/pull/128
     * and also, by the 'compiled' version in Next.js
     * @see: https://github.com/vercel/next.js/issues/11669
     */
    _implicitHeader?: () => void;
  }
}

export type Handler = (req: any, res: any, next: (error?: Error) => void) => void;

type App = FastifyInstance | ExpressApplication;

declare module '@gasket/core' {
  export interface HookExecTypes {
    middleware(gasket: Gasket, app: App): MaybeAsync<MaybeMultiple<Handler> >;
  }

  export interface GasketConfig {
    /** Middleware configuration */
    middleware?: {
      /** Plugin name */
      plugin: string;
      /** Paths for middleware */
      paths?: (string | RegExp)[];
    }[];
  }
}

declare const plugin: Plugin;
export default plugin;
