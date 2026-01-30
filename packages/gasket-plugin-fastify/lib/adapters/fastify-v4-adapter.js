// @ts-nocheck

import fastify from 'fastify';
import { FastifyAdapter } from './base-adapter.js';

const fallbackMap = {
  fatal: 'error',
  trace: 'debug'
};

/**
 * Adapter for Fastify v4.x
 *
 * Key differences from v5:
 * - Uses 'logger' option (not 'loggerInstance')
 * - No 'useSemicolonDelimiter' option
 * - Supports Node.js v14+
 */
export class FastifyV4Adapter extends FastifyAdapter {
  /**
   * Align Gasket logger with Fastify v4 requirements.
   * Ensures 'fatal' and 'trace' log levels exist.
   * @param {object} logger - Gasket logger instance
   * @returns {object} - Fastify-compatible logger
   */
  alignLogger(logger) {
    const fastifyLogger = logger;
    ['fatal', 'trace'].forEach(level => {
      if (!logger[level]) {
        fastifyLogger[level] = logger[fallbackMap[level]];
      }
    });
    return fastifyLogger;
  }

  /**
   * Create a Fastify v4 instance.
   * @param {object} config - Fastify configuration
   * @param {object} logger - Gasket logger
   * @returns {import('fastify').FastifyInstance} - Configured Fastify v4 instance
   */
  createInstance(config, logger) {
    const { trustProxy = false, disableRequestLogging = true, https, http2, ...restConfig } = config;

    const fastifyLogger = this.alignLogger(logger);

    // Fastify v4 uses 'logger' option
    return fastify({
      logger: fastifyLogger,
      trustProxy,
      disableRequestLogging,
      https,
      http2,
      ...restConfig
    });
  }
}
