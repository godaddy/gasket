/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-log" />

const fastify = require('fastify');
const middie = require('middie');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const debug = require('diagnostics')('gasket:fastify');

/**
 * Create the Fastify instance and setup the lifecycle hooks.
 * Fastify is compatible with express middleware out of the box, so we can
 * use the same middleware lifecycles.
 * @type {import('@gasket/engine').HookHandler<'createServers'>}
 */
// eslint-disable-next-line max-statements
module.exports = async function createServers(gasket, serverOpts) {
  const { logger, config } = gasket;
  const { middleware: middlewareConfig } = config;
  const trustProxy = config.fastify?.trustProxy ?? false;
  const excludedRoutesRegex =
    config.fastify && config.fastify.excludedRoutesRegex;
  // @ts-ignore
  const app = fastify({ logger, trustProxy });

  // Enable middleware for fastify@3
  await app.register(middie);

  // Add express-like `res.locals` object attaching data
  app.use(function attachLocals(req, res, next) {
    res.locals = {};
    next();
  });

  if (excludedRoutesRegex) {
    app.use(excludedRoutesRegex, cookieParser());
  } else {
    app.use(cookieParser());
  }

  const { compression: compressionConfig = true } = config.fastify || {};
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
          if (excludedRoutesRegex) {
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

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(
    Boolean
  );
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: async function handler(...args) {
      await app.ready();
      app.server.emit('request', ...args);
    }
  };
};
