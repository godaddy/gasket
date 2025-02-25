const cookieParser = require('cookie-parser');
const compression = require('compression');
// @ts-ignore
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
 * Checks if the middleware is valid and should be added.
 * @type {import('./internal').isValidMiddleware}
 */
function isValidMiddleware(middleware) {
  return Boolean(middleware && (!Array.isArray(middleware) || middleware.length > 0));
}

/**
 * Applies configuration settings to the middleware based on the plugin.
 * @type {import('./internal').applyMiddlewareConfig}
 */
function applyMiddlewareConfig(middleware, plugin, middlewareConfig, middlewarePattern) {
  const pluginName = plugin?.name || '';
  const configEntry = middlewareConfig.find(mw => mw.plugin === pluginName);

  if (configEntry) {
    // @ts-ignore
    middleware.paths = configEntry.paths;
    if (middlewarePattern) {
      // @ts-ignore
      middleware.paths.push(middlewarePattern);
    }
  }
}

/**
 * Attaches the middleware layers to the app.
 *  @type {import('./internal').applyMiddlewaresToApp}
 */
function applyMiddlewaresToApp(app, middlewares, middlewarePattern) {
  // @ts-ignore
  middlewares.forEach(async (layer) => {
    const { paths } = layer;
    if (paths) {
      app.use(paths, layer);
    } else {
      app.use(middlewarePattern || layer);
    }
  });
}

/**
 * Executes the middleware lifecycle for the application
 * @type {import('./internal').executeMiddlewareLifecycle}
 */
async function executeMiddlewareLifecycle(gasket, app, middlewarePattern) {
  const { config } = gasket;
  const middlewareConfig = config.middleware || [];
  const middlewares = [];

  await gasket.execApply('middleware', async (plugin, handler) => {
    // @ts-ignore - TS is unable to infer that `app` can be either an Express application or a Fastify instance
    const middleware = await handler(app);

    if (isValidMiddleware(middleware)) {
      applyMiddlewareConfig(middleware, plugin, middlewareConfig, middlewarePattern);
      middlewares.push(middleware);
    }
  });

  debug('applied %s middleware layers', middlewares.length);
  applyMiddlewaresToApp(app, middlewares, middlewarePattern);
}

module.exports = {
  applyCookieParser,
  applyCompression,
  executeMiddlewareLifecycle
};
