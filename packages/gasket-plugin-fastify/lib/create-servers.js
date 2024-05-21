/**
 * Create the Fastify instance and setup the lifecycle hooks.
 */
module.exports = async function createServers(gasket, serverOpts) {
  const fastify = require('fastify');
  const middie = require('middie');
  const cookieParser = require('cookie-parser');
  const compression = require('compression');

  const { logger, config } = gasket;
  const {
    fastify: {
      routes,
      trustProxy = false,
      excludedRoutesRegex,
      middlewareInclusionRegex,
      compression: compressionConfig = true
    } = {},
    middleware: middlewareConfig,
    root,
    http2
  } = config;

  const app = require('fastify')({ logger, trustProxy, http2 });

  if (excludedRoutesRegex) {
    // eslint-disable-next-line no-console
    const warn = logger ? logger.warn : console.warn;
    warn('DEPRECATED fastify config `excludedRoutesRegex` - use `middlewareInclusionRegex`');
  }


};
