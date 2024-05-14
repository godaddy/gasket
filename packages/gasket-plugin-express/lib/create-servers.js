/* eslint-disable max-statements */
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-logger" />
const debug = require('diagnostics')('gasket:express');

/**
 * Create the Express instance and setup the lifecycle hooks.
 * @type {import('@gasket/core').HookHandler<'createServers'>}
 */
module.exports = async function createServers(gasket, serverOpts) {
  const express = require('express');
  const cookieParser = require('cookie-parser');
  const compression = require('compression');

  const { config, logger } = gasket;
  const {
    express: {
      routes,
      excludedRoutesRegex,
      middlewareInclusionRegex,
      compression: compressionConfig = true,
      trustProxy = false
    } = {},
    http2,
    middleware: middlewareConfig
  } = config;

  if (excludedRoutesRegex) {
    // eslint-disable-next-line no-console
    const warn = logger ? logger.warn : console.warn;
    warn('DEPRECATED express config `excludedRoutesRegex` - use `middlewareInclusionRegex`');
  }

  const app = http2 ? require('http2-express-bridge')(express) : express();
  const useForAllowedPaths = (...middleware) =>
    middleware.forEach((mw) => {
      if (excludedRoutesRegex) {
        app.use(excludedRoutesRegex, mw);
      } else {
        app.use(mw);
      }
    });

  if (trustProxy) {
    app.set('trust proxy', trustProxy);
  }

  if (http2) {
    app.use(
      /*
       * This is a patch for the undocumented _implicitHeader used by the
       * compression middleware which is not present the http2 request object
       * @see: https://github.com/expressjs/compression/pull/128
       * and also, by the 'compiled' version in Next.js
       * @see: https://github.com/vercel/next.js/issues/11669
       */
      function http2Patch(req, res, next) {
        // @ts-ignore
        if (!res._implicitHeader) {
        // @ts-ignore
          res._implicitHeader = () => res.writeHead(res.statusCode);
        }
        return next();
      }
    );
  }


  // eslint-disable-next-line jsdoc/require-jsdoc
  function attachLogEnhancer(req) {
    req.logger.metadata = (metadata) => {
      req.logger = req.logger.child(metadata);
      attachLogEnhancer(req);
    };
  }

  useForAllowedPaths((req, res, next) => {
    req.logger = gasket.logger;
    attachLogEnhancer(req);
    next();
  });
  useForAllowedPaths(cookieParser());

  const middlewarePattern = middlewareInclusionRegex || excludedRoutesRegex;
  if (middlewarePattern) {
    app.use(middlewarePattern, cookieParser());
  } else {
    app.use(cookieParser());
  }

  if (compressionConfig) {
    app.use(compression());
  }

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

  debug('applied %s middleware layers to express', middlewares.length);
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

  await gasket.exec('express', app);

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
    handler: app
  };
};
