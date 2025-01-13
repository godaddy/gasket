import type { MaybeAsync, MaybeMultiple, Plugin } from '@gasket/core';
import type { Application, ErrorRequestHandler, Handler } from 'express';

declare module '@gasket/core' {
  export interface GasketActions {
    getExpressApp(): Application;
  }
  export interface GasketConfig {
    express?: {
      /** Whether responses are compressed (true by default) */
      compression?: boolean;
      /** Filter for which request URLs invoke Gasket middleware */
      middlewareInclusionRegex?: RegExp;
      /** @deprecated */
      excludedRoutesRegex?: RegExp;
      trustProxy?: boolean | string | number | Function;
    };
    middleware?: {
      plugin: string;
      paths?: (string | RegExp)[];
    }[];
  }

  export interface HookExecTypes {
    middleware(app: Application): MaybeAsync<MaybeMultiple<Handler> & { paths?: (string | RegExp)[] }>;
    express(app: Application): MaybeAsync<void>;
    errorMiddleware(): MaybeAsync<MaybeMultiple<ErrorRequestHandler>>;
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    apiApp?: boolean;
    addApiRoutes?: boolean;
    typescript?: boolean;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-express',
  hooks: {}
};

export = plugin;
