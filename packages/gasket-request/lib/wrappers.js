import { GasketRequest } from './request.js';

/** @type {import('./index.js').withGasketRequestCache} */
export function withGasketRequestCache(fn) {
  const cache = new WeakMap();
  return async (gasket, req, ...args) => {
    const normalizedReq = await GasketRequest.make(req);

    if (cache.has(normalizedReq)) {
      return cache.get(normalizedReq);
    }

    const result = await fn(gasket, normalizedReq, ...args);
    cache.set(normalizedReq, result);
    return result;
  };
}

/** @type {import('./index.js').withGasketRequest} */
export function withGasketRequest(fn) {
  return async (gasket, req, ...args) => {
    const normalizedReq = await GasketRequest.make(req);
    return await fn(gasket, normalizedReq, ...args);
  };
}
