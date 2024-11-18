import { Gasket } from '@gasket/core';
import { RequestLike } from './index.js';

export type withGasketRequest = (actionFn: (gasket: Gasket, req: RequestLike, ...args?: []) => Promise<unknown>) =>
  (gasket: Gasket, req: RequestLike, ...args?: []) => Promise<unknown>

export type withGasketRequestCache = (actionFn: (gasket: Gasket, req: RequestLike, ...args?: []) => Promise<unknown>) =>
  (gasket: Gasket, req: RequestLike, ...args?: []) => Promise<unknown>
