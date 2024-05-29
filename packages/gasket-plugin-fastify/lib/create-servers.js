/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware out of the box, so we can
 * use the same middleware lifecycles.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
// eslint-disable-next-line max-statements
module.exports = async function createServers(gasket, serverOpts) {

  const fastify = require('fastify');
  const cookieParser = require('cookie-parser');
  const compression = require('compression');
  const debug = require('diagnostics')('gasket:fastify');
  const { config, logger } = gasket;
  const {
    fastify: {
      routes,
      excludedRoutesRegex,
      middlewareInclusionRegex,
      compression: compressionConfig = true,
      trustProxy = false
    } = {},
    http2,
    middleware: middlewareConfig
  } = config;
  
  // @ts-ignore
  const app = fastify({ logger, trustProxy, http2 });

  // Enable middleware for fastify@4
  await app.register(require('@fastify/middie'));

  // Add express-like `res.locals` object attaching data
  app.use((req, res, next) => {
    res.locals = {};
    next();
  });

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;
  if (middlewarePattern) {
    app.use(excludedRoutesRegex, cookieParser());
  } else {
    app.use(cookieParser());
  }

  if (compressionConfig) {
    app.use(compression());
  }

  const middlewares = [];

  await gasket.execApply('middleware', async (plugin, handler) => {
    const middleware = await handler(app);
    if (middleware) {
      if (middlewareConfig) {
        const pluginName = plugin && plugin.name ? plugin.name : '';
        const mwConfig = middlewareConfig.find(
          (mw) => mw.plugin === pluginName
        );
        if (mwConfig) {
          middleware.paths = mwConfig.paths;
          if (middlewarePattern) {
            middleware.paths.push(excludedRoutesRegex);
          }
        }
      }
      middlewares.push(middleware);
    }
  });

  debug('applied %s middleware layers to fastify', middlewares.length);
  middlewares.forEach((layer) => {
    const { paths } = layer;
    if (paths) {
      app.use(paths, layer);
    } else if (excludedRoutesRegex) {
      app.use(excludedRoutesRegex, layer);
    } else {
      app.use(layer);
    }
  });

  // allow consuming apps to directly append options to their server
  await gasket.exec('fastify', app);

  if (routes) {
    for (const route of routes) {
      if (typeof route !== 'function') {
        throw new Error('Route must be a function');
      }
      await route(app);
    }
  }

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
}
