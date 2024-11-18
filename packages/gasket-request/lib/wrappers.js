import { GasketRequest } from './request.js';

/** @type {import('./index.js').withGasketRequestCache} */
export function withGasketRequestCache(actionFn) {
  const cache = new WeakMap();
  /** @type {import('./index.js').gasketRequestWrapper} */
  return async (gasket, req, ...args) => {
    const normalizedReq = await GasketRequest.make(req);

    if (cache.has(normalizedReq)) {
      return cache.get(normalizedReq);
    }

    const result = await actionFn(gasket, normalizedReq, ...args);
    cache.set(normalizedReq, result);
    return result;
  };
}

/** @type {import('./index.js').withGasketRequest} */
export function withGasketRequest(actionFn) {
  return async (gasket, req, ...args) => {
    const normalizedReq = await GasketRequest.make(req);
    return await actionFn(gasket, normalizedReq, ...args);
  };
}
