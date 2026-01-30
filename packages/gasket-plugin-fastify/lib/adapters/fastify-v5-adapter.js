// @ts-nocheck

import fastify from 'fastify';
import { FastifyAdapter } from './base-adapter.js';

const fallbackMap = {
  fatal: 'error',
  trace: 'debug'
};

/**
 * Adapter for Fastify v5.x
 *
 * Key differences from v4:
 * - Uses 'loggerInstance' option (not 'logger')
 * - Adds 'useSemicolonDelimiter' option (defaults to true)
 * - Requires Node.js v20+
 * - Stricter JSON Schema validation
 */
export class FastifyV5Adapter extends FastifyAdapter {
  /**
   * Align Gasket logger with Fastify v5 requirements.
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
   * Create a Fastify v5 instance.
   * @param {object} config - Fastify configuration
   * @param {object} logger - Gasket logger
   * @returns {import('fastify').FastifyInstance} - Configured Fastify v5 instance
   */
  createInstance(config, logger) {
    const {
      trustProxy = false,
      disableRequestLogging = true,
      https,
      http2,
      useSemicolonDelimiter = true,
      ...restConfig
    } = config;

    const fastifyLogger = this.alignLogger(logger);

    // Fastify v5 uses 'loggerInstance' instead of 'logger'
    // Router options are nested under 'routerOptions' to avoid deprecation warnings
    return fastify({
      loggerInstance: fastifyLogger,
      trustProxy,
      disableRequestLogging,
      https,
      http2,
      routerOptions: {
        useSemicolonDelimiter
      },
      ...restConfig
    });
  }
}
