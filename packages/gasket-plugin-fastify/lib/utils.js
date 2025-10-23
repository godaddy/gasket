// @ts-nocheck

import fastify from 'fastify';

const fallbackMap = {
  fatal: 'error',
  trace: 'debug'
};

/**
 * A helper function to ensure that all the required log levels
 * for a Fastify server are present.
 * @type {import('@gasket/plugin-fastify').alignLogger}
 */
function alignLogger(logger) {
  const fastifyLogger = logger;
  ['fatal', 'trace'].map(level => {
    if (!logger[level]) {
      fastifyLogger[level] = logger[fallbackMap[level]];
    }
  });

  return fastifyLogger;
}

let instance = null;

/**
 * Get the Fastify instance.
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @returns {import('fastify').FastifyInstance} - Fastify instance
 */
export function getAppInstance(gasket) {
  if (!instance) {
    const { fastify: fastifyConfig = {}, http2, https } = gasket.config;
    const { trustProxy = false, disableRequestLogging = true } = fastifyConfig;
    const fastifyLogger = alignLogger(gasket.logger);

    instance = fastify({ logger: fastifyLogger, trustProxy, https, http2, disableRequestLogging });
  }

  return instance;
}

export { alignLogger };

export function testClearAppInstance() {
  instance = null;
}
