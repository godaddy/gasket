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
module.exports = async function traceIdMiddleware(req, res, next) {
  console.log('traceIdMiddleware')
  try {
    const traceId = getCurrentTraceId();

    const trace = {
      traceId
    };

    res.locals.trace = trace;

    const { gasketData = {} } = res.locals;
    res.locals.gasketData = { ...gasketData, trace };

    console.log('---------------------------');
    console.log(res.locals.gasketData);
    console.log('---------------------------');
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
};

