/**
 * Base abstract class for Express version adapters.
 * Provides a common interface for creating and configuring Express instances
 * across different major versions.
 * @abstract
 */
export class ExpressAdapter {
  constructor() {
    if (new.target === ExpressAdapter) {
      throw new Error('ExpressAdapter is an abstract class and cannot be instantiated directly');
    }
  }

  /**
   * Create an Express instance with version-specific configuration.
   * Subclasses must implement this method to handle version-specific setup.
   * @abstract
   * @param {object} config - Express configuration options
   * @param {boolean} [config.http2] - Enable HTTP/2 via http2-express
   * @returns {import('express').Express} - Configured Express instance
   */
  // eslint-disable-next-line no-unused-vars
  createInstance(config) {
    throw new Error('createInstance() must be implemented by subclass');
  }
}
