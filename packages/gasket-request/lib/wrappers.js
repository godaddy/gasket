import { makeGasketRequest } from './request.js';
import { WeakPromiseKeeper } from './keeper.js';

/** @typedef {import('./index.js').GasketRequest} GasketRequest */

/** @type {typeof import('./index.d.ts').withGasketRequestCache} */
export function withGasketRequestCache(actionFn) {
  /**
   * @type {import('@gasket/request').WeakPromiseKeeper<GasketRequest>}
   */
  const keeper = new WeakPromiseKeeper();

  return async (gasket, req, ...args) => {
    const gasketRequest = await makeGasketRequest(req);

    if (!keeper.has(gasketRequest)) {
      keeper.set(gasketRequest, actionFn(gasket, gasketRequest, ...args));
    }
    return keeper.get(gasketRequest);
  };
}

/** @type {import('@gasket/request').withGasketRequest} */
export function withGasketRequest(actionFn) {
  return async (gasket, req, ...args) => {
    const gasketRequest = await makeGasketRequest(req);
    return await actionFn(gasket, gasketRequest, ...args);
  };
}
