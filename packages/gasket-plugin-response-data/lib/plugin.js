/* eslint require-atomic-updates: warn */

const mergeConfigFiles = require('./merge-config-files');
const mergeRootConfig = require('./merge-root-config');
const middleware = require('./middleware');
const { gasketDataMap } = require('./data-map');

module.exports = {
  name: require('../package').name,
  hooks: {
    async preboot(gasket) {
      const data = await gasket.execWaterfall(
        'gasketData',
        mergeRootConfig(gasket, mergeConfigFiles(gasket))
      );

      // Better error description for the lifecycles
      if (!data) {
        throw new Error(
          'An gasketData lifecycle hook did not return a config object.'
        );
      }

      gasketDataMap.set(gasket, data);
    },
    middleware,
    initReduxState(gasket, state, { res }) {
      const gasketData = res.locals?.gasketData || {};
      return {
        ...state,
        gasketData: {
          ...state.gasketData,
          ...gasketData
        }
      };
    },
    metadata(gasket, meta) {
      const { gasketDataDir = 'gasket-data/' } = gasket.config;
      return {
        ...meta,
        lifecycles: [
          {
            name: 'gasketData',
            method: 'execWaterfall',
            description: 'Adjust app level data after merged for the env',
            link: 'README.md#gasketData',
            parent: 'preboot'
          },
          {
            name: 'responseData',
            method: 'execWaterfall',
            description: 'Adjust response level data for each request',
            link: 'README.md#responseData',
            parent: 'middleware'
          }
        ],
        structures: [
          {
            name: 'gasket-data.config.js',
            description: 'App configuration with environment overrides',
            link: 'README.md'
          },
          {
            name: gasketDataDir,
            description: 'App configuration using environment files',
            link: 'README.md'
          }
        ]
      };
    }
  }
};
