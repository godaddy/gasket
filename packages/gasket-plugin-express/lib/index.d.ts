import type { MaybeAsync, MaybeMultiple } from '@gasket/core';
import type { Application, ErrorRequestHandler, Handler } from 'express';

declare module '@gasket/core' {
  export interface GasketConfig {
    express?: {
      /** Whether responses are compressed (true by default) */
      compression?: boolean;
      /** Filter for which request URLs invoke Gasket middleware */
      middlewareInclusionRegex?: RegExp;
      /** Glob pattern for source files setting up express routes */
      routes?: Array<MaybeAsync<(app: Application) => void>>;
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
  }
}

export default {
  name: '@gasket/plugin-express',
  hooks: {}
};
