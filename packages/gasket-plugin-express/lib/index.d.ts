import type { MaybeAsync, MaybeMultiple, Plugin } from '@gasket/core';
import type { Application, ErrorRequestHandler, Handler } from 'express';


export interface ExpressConfig {
  /** Whether responses are compressed (true by default) */
  compression?: boolean;
  trustProxy?: boolean | string | number | Function;
}
declare module '@gasket/core' {
  export interface GasketActions {
    /** @deprecated */
    getExpressApp(): Application;
  }
  export interface GasketConfig {
    express?: ExpressConfig;
  }

  export interface HookExecTypes {
    express(app: Application): MaybeAsync<void>;
    errorMiddleware(): MaybeAsync<MaybeMultiple<ErrorRequestHandler>>;
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    apiApp?: boolean;
    addApiRoutes?: boolean;
  }
}

declare const plugin: Plugin;

export default plugin;
