const merge = require('lodash.merge');

function middleware(gasket) {
  return async function gasketDataMiddleware(req, res, next) {
    try {
      const publicGasketData = await gasket.actions.getPublicGasketData(req);
      res.locals.gasketData = merge(res.locals?.gasketData ?? {}, publicGasketData);

      return void next();
    } catch (err) {
      return void next(err);
    }
  };
}

module.exports = middleware;
