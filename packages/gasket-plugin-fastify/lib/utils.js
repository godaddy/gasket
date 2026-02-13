// @ts-nocheck

import { createFastifyAdapter } from './adapters/index.js';

let instance = null;
let adapter = null;

/**
 * Get the Fastify instance.
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @returns {import('fastify').FastifyInstance} - Fastify instance
 */
export function getAppInstance(gasket) {
  if (!instance) {
    const { fastify: fastifyConfig = {}, http2, https } = gasket.config;

    // Create the appropriate adapter for the installed Fastify version
    adapter = createFastifyAdapter();

    // Use the adapter to create the Fastify instance
    instance = adapter.createInstance(
      {
        ...fastifyConfig,
        https,
        http2
      },
      gasket.logger
    );
  }

  return instance;
}

/**
 * Clear the Fastify app instance (for testing only)
 * @returns {void}
 */
export function testClearAppInstance() {
  instance = null;
  adapter = null;
}
