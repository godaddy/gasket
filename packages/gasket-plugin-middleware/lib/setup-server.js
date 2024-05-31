/* eslint-disable complexity */
/* eslint-disable max-statements */
const createFastifyApp = require('./create-fastify-app');
const createExpressApp = require('./create-express-app');

module.exports = async function setupServer(gasket, type) {
  const cookieParser = require('cookie-parser');
  const compression = require('compression');

  const { config, logger } = gasket;
  const { http2 } = config;
  const {
    routes,
    excludedRoutesRegex,
    middlewareInclusionRegex,
    compression: compressionConfig = true,
    trustProxy = false
  } = config[type];

  if (excludedRoutesRegex) {
    // eslint-disable-next-line no-console
    const warn = logger ? logger.warn : console.warn;
    warn(`DEPRECATED express config 'excludedRoutesRegex' - use 'middlewareInclusionRegex'`);
  }

  let app;
  if (type === 'express') {
    app = createExpressApp({ http2 });

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
  }

  if (type === 'fastify') {
    app = createFastifyApp({ http2, trustProxy, logger });

    await app.register(require('middie'));

    // Add express-like `res.locals` object attaching data
    app.use((req, res, next) => {
      res.locals = {};
      next();
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

  await gasket.exec(type, app);

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

  return app;
};
