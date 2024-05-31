import cookieParser from 'cookie-parser';
import compression from 'compression';
import diagnostics from 'diagnostics';

const debug = diagnostics('gasket:middleware');

/**
 *
 */
export function applyCookieParser(app, middlewarePattern) {
  if (middlewarePattern) {
    app.use(middlewarePattern, cookieParser());
  } else {
    app.use(cookieParser());
  }
}

/**
 *
 */
export function applyCompression(app, compressionConfig) {
  if (compressionConfig) {
    app.use(compression());
  }
}


/**
 * Setup the middleware lifecycle hook
 * 
 */
export async function executeMiddlewareLifecycle(gasket, app, middlewarePattern) {
  const { config } = gasket;
  const {
    middleware: middlewareConfig
  } = config;

  const middlewares = [];
  await gasket.execApply('middleware', async (plugin, handler) => {
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
  middlewares.forEach((layer) => {
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


