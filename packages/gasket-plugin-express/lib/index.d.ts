import type { MaybeAsync, MaybeMultiple } from '@gasket/engine';
import type { Application, ErrorRequestHandler, Handler } from 'express';

declare module '@gasket/engine' {
  export interface GasketConfig {
    /** Whether responses are compressed (true by default) */
    compression?: boolean,
    /** Filter for which request URLs invoke Gasket middleware */
    middlewareInclusionRegex?: RegExp,
    /** Glob pattern for source files setting up express routes */
    routes?: string,
    /** @deprecated */
    excludedRoutesRegex?: RegExp
  }

  export interface HookExecTypes {
    middleware(app: Application): MaybeAsync<MaybeMultiple<Handler>>,
    express(app: Application): MaybeAsync<void>,
    errorMiddleware(app: Application): MaybeAsync<MaybeMultiple<ErrorRequestHandler>>
  }
}
