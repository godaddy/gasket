const opentelemetry = require('@opentelemetry/api');

function getCurrentTraceId() {
  const activeContext = opentelemetry.context.active();
  if (activeContext) {
    const currentSpan = opentelemetry.trace.getSpanContext(activeContext);
    return currentSpan ? currentSpan.traceId : null;
  }
  return null;
};

/**
 * Determines request user's traceId
 *
 * @param {Request} req Incoming HTTP request.
 * @param {Response} res Outgoing HTTP response.
 * @param {Function} next Callback
 * @public
 */
module.exports = async function middleware(gasket) {
  return function traceIdMiddleware(req, res, next) {
    const currentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());

    try {
      const traceId = getCurrentTraceId();
      console.log('traceIdMiddleware', traceId)
      const trace = {
        traceId
      };

      res.locals.trace = trace;

      const { gasketData = {} } = res.locals;
      res.locals.gasketData = { ...gasketData, trace };

      gasket.logger.info('gasketLogger: traceIdMiddleware', res.locals.gasketData);
      currentSpan?.addEvent(`traceIdMiddleware requested: ${JSON.stringify(res.locals.gasketData)}`);
      res.setTraceIdCookie = function setStaticTraceCookie() {
        res.cookie('traceid', res.locals.trace.traceId, {
          maxAge: 1000 * 60 * 2, // 2 minutes
          httpOnly: false,
          signed: false
        });
      };

      return void next();
    } catch (err) {
      return void next(err);
    }
  }
};




// const api = require('@opentelemetry/api');
// const { BUILD_INFO } = require('./build-info');
// const util = require('util');
// const traceIdMiddleware = require('./traceid');

// const testException = () => {
//   throw new Error('This is a test exception');
// };


// module.exports = function middleware(gasket, app) {
//   console.log('traceIdMiddleware')
//   try {
//     const traceId = getCurrentTraceId();

//     const trace = {
//       traceId
//     };

//     res.locals.trace = trace;

//     const { gasketData = {} } = res.locals;
//     res.locals.gasketData = { ...gasketData, trace };

//     console.log('---------------------------');
//     console.log(res.locals.gasketData);
//     console.log('---------------------------');
//     res.setTraceIdCookie = function setStaticTraceCookie() {
//       res.cookie('traceid', res.locals.trace.traceId, {
//         maxAge: 1000 * 60 * 2, // 2 minutes
//         httpOnly: false,
//         signed: false
//       });
//     };

//     return void next();
//   } catch (err) {
//     return void next(err);
//   }
// }

// module.exports = function middleware(gasket, app) {
//   console.log('OTEL Middleware HOOK')
//   const { logger: Logger } = gasket;


//   function logInfo(req, res, next) {
//     console.log('OTEL Middleware logInfo');
//     const currentSpan = api.trace.getSpan(api.context.active());
//     const currentContext = currentSpan?.spanContext();

//     const info = {
//       ...BUILD_INFO,
//       uptime: process.uptime(),
//       process_arch: process.arch,
//       process_platform: process.platform,
//       otel: currentContext,
//       path: req.path,
//       cookies: req.cookies,
//     };
//     currentSpan?.addEvent(`logInfo requested: ${util.inspect(info)}`);
//     // Logger.info('logInfo requested: ', info);
//     next();
//   }

//   function infoRouteHandler(req, res, next) {
//     console.log('OTEL Info Middleware handler', req.query);
//     const currentSpan = api.trace.getSpan(api.context.active());
//     const currentContext = currentSpan?.spanContext();
//     if (req.query?.exception === 'true') {
//       try {
//         testException();
//       } catch (err) {
//         if (err instanceof Error) {
//           currentSpan?.recordException(err);
//         }
//       }
//     }

//     const info = {
//       ...BUILD_INFO,
//       uptime: process.uptime(),
//       process_arch: process.arch,
//       process_platform: process.platform,
//       otel: currentContext,
//       path: req.path,
//     };

//     // duplicate log on purpose: to show you can do it either way:
//     currentSpan?.addEvent(`/info requested: ${util.inspect(info)}`);
//     // Logger.info('info requested', info);

//     if (req.accepts().includes('application/json')) {
//       res.json(info);
//     } else {
//       const printOut = Object.entries(info)
//         .map(([k, v]) => {
//           return `${k}: ${JSON.stringify(v)}\n`;
//         })
//         .join('');
//       res.header('Content-Type', 'text/plain');
//       res.send(printOut);
//     }
//   }

//   app.get('/info', infoRouteHandler);

//   return [
//     logInfo,
//     traceIdMiddleware
//   ]

// }
