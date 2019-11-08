const { getReduxConfig } = require('./utils');

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 *
 * @type {{hooks: {middleware, webpack}}}
 */
module.exports = {
  name: require('../package').name,
  dependencies: ['log'],
  hooks: {
    async create(gasket, { pkg }) {
      pkg.add('dependencies', {
        '@gasket/redux': '^3.0.0',
        'react-redux': '^7.1.0',
        'redux': '^4.0.4'
      });
    },
    webpack(gasket) {
      const reduxConfig = getReduxConfig(gasket);

      //
      // Setup webpack alias to override the default redux/make-store if set in config
      //
      return reduxConfig.makeStore && {
        resolve: {
          alias: {
            '@gasket/redux/make-store': reduxConfig.makeStore
          }
        }
      };
    },
    middleware(gasket) {
      return require('./middleware')(gasket);
    }
  }
};
