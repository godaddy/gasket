/// <reference types="@gasket/plugin-fastify" />

const middie = require('middie');
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
  await app.register(middie);

  // Add express-like `res.locals` object attaching data
  app.use(function attachLocals(req, res, next) {
    res.locals = {};
    next();
  });

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;

  applyCookieParser(app, middlewarePattern);
  applyCompression(app, compressionConfig);

  executeMiddlewareLifecycle(gasket, app, middlewarePattern);
};
