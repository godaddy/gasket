import { createExpressAdapter } from './adapters/index.js';

let instance = null;

/**
 * Get the Express instance.
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @returns {import('express').Express} - Express instance
 */
export function getAppInstance(gasket) {
  if (!instance) {
    const { http2 } = gasket.config;
    instance = createExpressAdapter().createInstance({ http2: Boolean(http2) });
  }

  return instance;
}

/**
 * Clear the Express instance for testing purposes.
 */
export function testClearAppInstance() {
  instance = null;
}
