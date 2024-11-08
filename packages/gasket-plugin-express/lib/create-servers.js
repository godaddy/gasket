/* eslint-disable max-statements */
/// <reference types="@gasket/plugin-https" />
/// <reference types="@gasket/plugin-log" />

const { promisify } = require('util');
const debug = require('diagnostics')('gasket:express');
const glob = promisify(require('glob'));
const path = require('path');

/**
 * Create the Express instance and setup the lifecycle hooks.
 * @type {import('@gasket/engine').HookHandler<'createServers'>}
 */
module.exports = async function createServers(gasket, serverOpts) {
  const express = require('express');
  const cookieParser = require('cookie-parser');
  const compression = require('compression');

  const { config, logger } = gasket;
  const {
    root,
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
    const warn = logger ? logger.warning : console.warn;
    warn('DEPRECATED express config `excludedRoutesRegex` - use `middlewareInclusionRegex`');
  }

  const app = http2 ? require('http2-express')(express) : express();

  if (trustProxy) {
    app.set('trust proxy', trustProxy);
  }

  if (http2) {
    app.use(
      /*
       * This is a patch for the undocumented _implicitHeader used by the
       * compression middleware which is not present the http2 request object
       * @see: https://github.com/expressjs/compression/pull/128
       * and also, by the the 'compiled' version in Next.js
       * @see: https://github.com/vercel/next.js/issues/11669
       */
      function http2Patch(req, res, next) {
        // @ts-ignore
        if (!res._implicitHeader) {
          // @ts-ignore
          res._implicitHeader = () => res.writeHead(res.statusCode);
        }
        return next();
      });
  }

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
    const files = await glob(`${ routes }.js`, { cwd: root });
    for (const file of files) {
      const route = require(path.join(root, file));
      (route.default || route)(app);
    }
  }

  const postRenderingStacks = (await gasket.exec('errorMiddleware')).filter(Boolean);
  postRenderingStacks.forEach((stack) => app.use(stack));

  return {
    ...serverOpts,
    handler: app
  };
};
