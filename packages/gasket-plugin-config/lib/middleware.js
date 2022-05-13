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

      // Error handling
      // Better error description for the appRequestConfig & appEnvConfig lifecycles
      // In the event a config object isn't returned from the hook(s)
      // it will result in a error in the destructuring of req.config
      if (!req.config) {
        throw new Error(
          // eslint-disable-next-line max-len
          'req.config is undefined - Ensure that all plugins hooking into the appRequestConfig and appEnvConfig lifecycle return a config object.'
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
