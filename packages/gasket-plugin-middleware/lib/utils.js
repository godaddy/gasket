import cookieParser from 'cookie-parser';
import compression from 'compression';
import diagnostics from 'diagnostics';

const debug = diagnostics('gasket:middleware');

/**
 * Ensures the app supports Express-style middleware (i.e., has .use and .set)
 * @type {import('./internal.d.ts').canUseMiddleware}
 */
function canUseMiddleware(app) {
  return typeof app?.use === 'function' && typeof app?.set === 'function';
}

/**
 * Applies the cookie parser based on the middleware pattern.
 * @type {import('./internal.d.ts').applyCookieParser}
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
 * @type {import('./internal.d.ts').applyCompression}
 */
function applyCompression(app, compressionConfig) {
  if (compressionConfig) {
    app.use(compression());
  }
}

/**
 * Checks if the middleware is valid and should be added.
 * @type {import('./internal.d.ts').isValidMiddleware}
 */
function isValidMiddleware(middleware) {
  return Boolean(middleware && (!Array.isArray(middleware) || middleware.length > 0));
}

/**
 * Determines whether a value is a middleware object with a `handler` property.
 * @type {import('./internal.d.ts').isMiddlewareObject}
 */
function isMiddlewareObject(value) {
  return (
    typeof value === 'object' &&
    value != null &&
    'handler' in value &&
    typeof value.handler === 'function'
  );
}

/**
 * Normalizes a middleware entry into a consistent { handler, paths } shape.
 * @type {import('./internal.d.ts').normalizeMiddlewareEntry}
 */
function normalizeMiddlewareEntry(entry) {
  if (typeof entry === 'function') {
    return { handler: /** @type {import('express').Handler} */ (entry) };
  }

  if (isMiddlewareObject(entry)) {
    return { handler: entry.handler, paths: entry.paths };
  }

  return { handler: void 0 };
}

/**
 * Applies a single middleware entry to the app using the appropriate path logic.
 * @type {import('./internal.d.ts').applyMiddlewareToApp}
 */
function applyMiddlewareToApp(app, handler, paths, middlewarePattern) {
  if (paths) {
    app.use(paths, handler);
  } else if (middlewarePattern) {
    app.use(middlewarePattern, handler);
  } else {
    app.use(handler);
  }
}

/**
 * Applies configuration settings to the middleware based on the plugin.
 * @type {import('./internal.d.ts').applyMiddlewareConfig}
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
 * Applies a list of middleware layers to an Express app.
 * Handles various formats: function, object with `handler`, or arrays of both.
 * @type {import('./internal.d.ts').applyMiddlewaresToApp}
 */
function applyMiddlewaresToApp(app, middlewares, middlewarePattern) {
  if (!canUseMiddleware(app)) {
    debug('Skipping middleware application – not an Express app');
    return;
  }

  middlewares.flat().forEach((layer) => {
    if (!layer) return;

    const { handler, paths } = normalizeMiddlewareEntry(layer);
    if (!handler) return;

    applyMiddlewareToApp(app, handler, paths, middlewarePattern);
  });
}

/**
 * Executes the middleware lifecycle for the application
 * @type {import('./internal.d.ts').executeMiddlewareLifecycle}
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

export {
  applyCookieParser,
  applyCompression,
  executeMiddlewareLifecycle,
  isValidMiddleware,
  applyMiddlewareConfig,
  applyMiddlewaresToApp,
  canUseMiddleware
};
