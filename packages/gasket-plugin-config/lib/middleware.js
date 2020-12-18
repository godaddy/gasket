const { ENV_CONFIG } = require('./constants');
const merge = require('lodash.merge');

/**
 * Add middleware to gather config details
 *
 * @param {Gasket} gasket - The gasket API
 * @returns {function} Express middleware to apply
 */
function handler(gasket) {
  return async (req, res, next) => {
    try {
      req.config = await gasket.execWaterfall(
        'appRequestConfig',
        gasket[ENV_CONFIG],
        req,
        res);

      const { gasketData = {} } = res.locals;
      const { public: config = {} } = req.config;

      if (Object.keys(config).length > 0 && config.constructor === Object) {
        res.locals.gasketData = merge(gasketData, { config });
      }

      return void next();
    } catch (err) {
      return void next(err);
    }
  };
}

module.exports = {
  timing: {
    before: ['@gasket/plugin-redux']
  },
  handler
};
