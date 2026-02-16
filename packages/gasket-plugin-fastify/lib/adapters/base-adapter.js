/**
 * Base abstract class for Fastify version adapters.
 * Provides a common interface for creating and configuring Fastify instances
 * across different major versions.
 * @abstract
 */
export class FastifyAdapter {
  constructor() {
    if (new.target === FastifyAdapter) {
      throw new Error('FastifyAdapter is an abstract class and cannot be instantiated directly');
    }
  }

  /**
   * Create a Fastify instance with version-specific configuration.
   * Subclasses must implement this method to handle version-specific options.
   * @abstract
   * @param {object} config - Fastify configuration options
   * @param {boolean} [config.trustProxy] - Trust proxy headers
   * @param {object} [config.https] - HTTPS configuration
   * @param {boolean} [config.http2] - Enable HTTP/2
   * @param {boolean} [config.disableRequestLogging] - Disable request logging
   * @param {object} logger - Gasket logger instance
   * @returns {ReturnType<typeof import('fastify').default>} - Configured Fastify instance
   */
  // eslint-disable-next-line no-unused-vars
  createInstance(config, logger) {
    throw new Error('createInstance() must be implemented by subclass');
  }
}
