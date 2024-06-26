/// <reference types="@gasket/plugin-fastify" />

const { applyCompression, applyCookieParser, executeMiddlewareLifecycle } = require('./utils');

/**
 * Fastify lifecycle to add middleware
 * @type {import('@gasket/core').HookHandler<'fastify'>}
 */
module.exports = async function fastify(gasket, app) {
  const { config } = gasket;
  const {
    fastify: {
      middlewareInclusionRegex,
      excludedRoutesRegex,
      compression: compressionConfig = true
    } = {}
  } = config;

  // Enable middleware for fastify@3
  await app.register(require('@fastify/express'));

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;

  applyCookieParser(app, middlewarePattern);
  applyCompression(app, compressionConfig);

  executeMiddlewareLifecycle(gasket, app, middlewarePattern);
};
