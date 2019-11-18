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
    },

    metadata(gasket, meta) {
      const { configPath = 'config' } = gasket.config;
      return {
        ...meta,
        lifecycles: [{
          name: 'appEnvConfig',
          method: 'execWaterfall',
          description: 'Adjust app level config after merged for the env',
          link: 'README.md#appEnvConfig',
          parent: 'preboot'
        }, {
          name: 'appRequestConfig',
          method: 'execWaterfall',
          description: 'Adjust app level config for each request',
          link: 'README.md#appRequestConfig',
          parent: 'middleware'
        }],
        structures: [{
          name: 'app.config.js',
          description: 'App configuration with environment overrides',
          link: 'README.md'
        }, {
          name: configPath,
          description: 'App configuration using environment files',
          link: 'README.md'
        }]
      };
    }
  }
};
