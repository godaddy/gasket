const cookieParser = require('cookie-parser');
const compression = require('compression');
const diagnostics = require('diagnostics');

const debug = diagnostics('gasket:middleware');

/**
 * Ensures the app supports Express-style middleware (i.e., has .use and .set)
 * @type {import('./internal').canUseMiddleware}
 */
function canUseMiddleware(app) {
  return typeof app?.use === 'function' && typeof app?.set === 'function';
}

/**
 * Applies the cookie parser based on the middleware pattern.
 * @type {import('./internal').applyCookieParser}
 */
function applyCookieParser(app, middlewarePattern) {
  const middleware = cookieParser();
  if (middlewarePattern) {
    app.use(middlewarePattern, middleware);
  } else {
    app.use(middleware);
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
    middleware.paths = configEntry.paths || [];
    if (middlewarePattern) {
      middleware.paths.push(middlewarePattern);
    }
  }
}

/**
  * Attaches middleware layers to an Express app, using optional paths or a global pattern.
 * Supports both function-style and object-style middleware entries.
 * @type {import('./internal').applyMiddlewaresToApp}
 */
function applyMiddlewaresToApp(app, middlewares, middlewarePattern) {
  if (!canUseMiddleware(app)) {
    debug('Skipping middleware application – not an Express app');
    return;
  }

  middlewares.forEach((layer) => {
    // Normalize: allow either direct middleware function or object with { handler, paths }
    const paths = layer.paths;
    const handler = typeof layer === 'function' ? layer : layer.handler;

    if (!handler) return; // Skip if handler is missing or invalid

    // Apply the middleware to specified paths, a global pattern, or directly to the app
    if (paths) {
      app.use(paths, handler);
    } else if (middlewarePattern) {
      app.use(middlewarePattern, handler);
    } else {
      app.use(handler);
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

  if (canUseMiddleware(app)) {
    applyCookieParser(app, middlewarePattern);
    applyCompression(app, config.compression);
  } else {
    debug('Skipping Express-specific middleware: app is not Express');
  }

  await gasket.execApply('middleware', async (plugin, handler) => {
    const middleware = await handler(app);

    if (isValidMiddleware(middleware)) {
      applyMiddlewareConfig(middleware, plugin, middlewareConfig, middlewarePattern);
      middlewares.push(middleware);
    }
  });

  debug('applied %s middleware layers', middlewares.length);

  if (canUseMiddleware(app)) {
    applyMiddlewaresToApp(app, middlewares, middlewarePattern);
  }
}

module.exports = {
  applyCookieParser,
  applyCompression,
  executeMiddlewareLifecycle,
  isValidMiddleware,
  applyMiddlewareConfig,
  applyMiddlewaresToApp,
  canUseMiddleware
};
