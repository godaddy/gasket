/* eslint require-atomic-updates: warn */

const mergeConfigFiles = require('./merge-config-files');
const mergeRootConfig = require('./merge-root-config');
const { ENV_CONFIG } = require('./constants');

module.exports = {
  name: require('../package').name,
  hooks: {
    async preboot(gasket) {
      gasket[ENV_CONFIG] = await gasket.execWaterfall(
        'appEnvConfig',
        mergeRootConfig(gasket, mergeConfigFiles(gasket))
      );
    },

    middleware: {
      timing: {
        before: ['redux']
      },
      handler(gasket) {
        return async (req, res, next) => {
          try {
            req.config = await gasket.execWaterfall(
              'appRequestConfig',
              gasket[ENV_CONFIG],
              req,
              res);
            return void next();
          } catch (err) {
            return void next(err);
          }
        };
      }
    },

    initReduxState(gasket, state, req) {
      const { redux } = req.config || {};
      return {
        ...state,
        config: redux
      };
    }
  }
};
