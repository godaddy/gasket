import type { MaybeAsync, MaybeMultiple } from '@gasket/engine';
import type { Application, ErrorRequestHandler, Handler } from 'express';

declare module '@gasket/engine' {
  export interface GasketConfig {
    compression?: boolean,
    excludedRoutesRegex?: RegExp
  }

  export interface HookExecTypes {
    middleware(app: Application): MaybeAsync<MaybeMultiple<Handler>>,
    express(app: Application): MaybeAsync<void>,
    errorMiddleware(app: Application): MaybeAsync<MaybeMultiple<ErrorRequestHandler>>
  }
}
