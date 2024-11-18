import { GasketRequest } from './request.js';

/** @type {import('./internal.d.ts').withGasketRequestCache} */
export function withGasketRequestCache(actionFn) {
  const cache = new WeakMap();

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

/** @type {import('./internal.d.ts').withGasketRequest} */
export function withGasketRequest(actionFn) {
  return async (gasket, req, ...args) => {
    const normalizedReq = await GasketRequest.make(req);
    return await actionFn(gasket, normalizedReq, ...args);
  };
}
