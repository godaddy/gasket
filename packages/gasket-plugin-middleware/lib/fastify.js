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
  // @fastify/express must be installed by the app when using middleware with Fastify
  let fastifyExpress;
  try {
    fastifyExpress = (await import('@fastify/express')).default;
    await app.register(fastifyExpress);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        '@fastify/express is required when using @gasket/plugin-middleware with Fastify. ' +
        'Please install it: npm install @fastify/express'
      );
    }
    throw err;
  }

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
