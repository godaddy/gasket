const cookieParser = require('cookie-parser');
const compression = require('compression');
const diagnostics = require('diagnostics');

const debug = diagnostics('gasket:middleware');

/**
 * Applies the cookie parser based on the middleware pattern.
 * @type {import('./internal').applyCookieParser}
 */
function applyCookieParser(app, middlewarePattern) {
  if (middlewarePattern) {
    app.use(middlewarePattern, cookieParser());
  } else {
    app.use(cookieParser());
  }
}

/**
 * Applies compression to the application if a compression config is present.
 * @type {import('./internal').applyCompression}
 */
function applyCompression(app, compressionConfig) {
  if (compressionConfig) {
    app.use(compression());
  }
}

/**
 * Executes the middleware lifecycle for the application
 * @type {import('./internal').executeMiddlewareLifecycle}
 */
async function executeMiddlewareLifecycle(gasket, app, middlewarePattern) {
  const { config } = gasket;
  const {
    middleware: middlewareConfig
  } = config;

  const middlewares = [];
  await gasket.execApply('middleware', async (plugin, handler) => {
    // @ts-ignore - TS is unable to infer that `app` can be either an Express application or a Fastify instance
    const middleware = await handler(app);

    if (middleware && (!Array.isArray(middleware) || middleware.length)) {
      if (middlewareConfig) {
        const pluginName = plugin && plugin.name ? plugin.name : '';
        const mwConfig = middlewareConfig.find(mw => mw.plugin === pluginName);
        if (mwConfig) {
          middleware.paths = mwConfig.paths;
          if (middlewarePattern) {
            middleware.paths.push(middlewarePattern);
          }
        }
      }
      middlewares.push(middleware);
    }
  });

  debug('applied %s middleware layers', middlewares.length);
  middlewares.forEach(async (layer) => {
    const { paths } = layer;
    if (paths) {
      app.use(paths, layer);
    } else if (middlewarePattern) {
      app.use(middlewarePattern, layer);
    } else {
      app.use(layer);
    }
  });
}

module.exports = {
  applyCookieParser,
  applyCompression,
  executeMiddlewareLifecycle
};
