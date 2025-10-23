/// <reference types="@gasket/plugin-fastify" />

import { applyCompression, applyCookieParser, executeMiddlewareLifecycle } from './utils.js';

/**
 * Fastify lifecycle to add middleware
 * @type {import('@gasket/core').HookHandler<'fastify'>}
 */
export default async function fastify(gasket, app) {
  const { config } = gasket;
  const {
    fastify: {
      middlewareInclusionRegex,
      excludedRoutesRegex,
      compression: compressionConfig = true
    } = {}
  } = config;

  // Enable middleware for fastify@3
  const { default: fastifyExpress } = await import('@fastify/express');
  await app.register(fastifyExpress);

  // Access the underlying Express app
  const expressApp = app.express;

  // Add express-like `res.locals` object attaching data
  app.addHook('preHandler', function attachLocals(req, res, next) {
    res.locals = {};
    next();
  });

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;

  applyCookieParser(expressApp, middlewarePattern);
  applyCompression(expressApp, compressionConfig);

  executeMiddlewareLifecycle(gasket, expressApp, middlewarePattern);
};
