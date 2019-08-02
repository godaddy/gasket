const { getReduxConfig } = require('./utils');

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 *
 * @type {{hooks: {middleware, webpack}}}
 */
module.exports = {
  name: 'redux',
  dependencies: ['log', 'core'],
  hooks: {
    async create(gasket, { pkg }) {
      pkg.add('dependencies', {
        '@gasket/redux': '^2.0.0',
        'react-redux': '^5.0.7',
        'redux': '^3.7.2'
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
