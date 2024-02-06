const { ENV_CONFIG } = require('./constants');
const merge = require('lodash.merge');

/**
 * Add middleware to gather config details
 *
 * @param {Gasket} gasket - The gasket API
 * @returns {Function} Express middleware to apply
 * @throws {Error} If the appRequestConfig lifecycle hook did not return a
 * config object.
 */
function handler(gasket) {
  return async (req, res, next) => {
    try {
      req.config = await gasket.execWaterfall(
        'appRequestConfig',
        gasket[ENV_CONFIG],
        {
          req,
          res
        }
      );

      // Error handling
      // Better error description for the appRequestConfig lifecycles
      // In the event a config object isn't returned from the hook(s)
      // it will result in a error in the destructuring of req.config
      if (!req.config) {
        throw new Error(
          'An appRequestConfig lifecycle hook did not return a config object.'
        );
      }

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
