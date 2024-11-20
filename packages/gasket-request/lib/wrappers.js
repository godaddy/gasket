import { makeGasketRequest } from './request.js';

/** @type {typeof import('./index.d.ts').withGasketRequestCache} */
export function withGasketRequestCache(actionFn) {
  const cache = new WeakMap();

  return async (gasket, req, ...args) => {
    const gasketRequest = await makeGasketRequest(req);

    if (cache.has(gasketRequest)) {
      return cache.get(gasketRequest);
    }

    const promise = actionFn(gasket, gasketRequest, ...args);
    cache.set(gasketRequest, promise);
    return await promise;
  };
}

/** @type {import('./index.d.ts').withGasketRequest} */
export function withGasketRequest(actionFn) {
  return async (gasket, req, ...args) => {
    const gasketRequest = await makeGasketRequest(req);
    return await actionFn(gasket, gasketRequest, ...args);
  };
}
