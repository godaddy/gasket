const merge = require('lodash.merge');
const { gasketDataMap } = require('./data-map');

const deepClone = json => JSON.parse(JSON.stringify(json));

/**
 * Add middleware to gather config details
 *
 * @param {Gasket} gasket - The gasket API
 * @returns {Function} Express middleware to apply
 * @throws {Error} If the responseData lifecycle hook did not return a
 * config object.
 */
function handler(gasket) {
  return async (req, res, next) => {
    const data = gasketDataMap.get(gasket);

    try {
      const publicGasketData = await gasket.execWaterfall(
        'responseData',
        deepClone(data?.public ?? {}),
        {
          req,
          res
        }
      );

      // Error handling
      // Better error description for the responseData lifecycles
      // In the event a config object isn't returned from the hook(s)
      // it will result in an error in the destructuring of req.gasketData
      if (!publicGasketData) {
        throw new Error(
          'A responseData lifecycle hook did not return a config object.'
        );
      }

      if (Object.keys(publicGasketData).length > 0 && publicGasketData.constructor === Object) {
        res.locals.gasketData = merge(res.locals?.gasketData ?? {}, publicGasketData);
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
