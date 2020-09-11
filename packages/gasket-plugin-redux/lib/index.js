const path = require('path');
const { name, devDependencies } = require('../package');
const configure = require('./configure');
const prompt = require('./prompt');
const middleware = require('./middleware');

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 *
 * @type {{hooks: {middleware, webpack}}}
 */
module.exports = {
  name,
  dependencies: ['@gasket/plugin-log'],
  hooks: {
    configure,
    prompt,
    async create(gasket, context) {
      const { pkg, files } = context;

      pkg.add('dependencies', {
        '@gasket/redux': devDependencies['@gasket/redux'],
        'react-redux': devDependencies['react-redux'],
        'redux': devDependencies.redux
      });

      files.add(
        `${ __dirname }/../generator/*`,
        `${ __dirname }/../generator/**/*`
      );
    },
    webpack(gasket) {
      const { redux: reduxConfig } = gasket.config;
      // webpack is not listed as a required dependency but if this lifecycle
      // is invoked we can assume it has been installed by @gasket/plugin-webpack
      const webpack = require('webpack');

      return {
        plugins: [
          new webpack.EnvironmentPlugin({
            GASKET_MAKE_STORE_FILE: reduxConfig.makeStore
          })
        ]
      };
    },
    middleware,
    metadata(gasket, meta) {
      const { root, redux: reduxConfig = {} } = gasket.config;
      const { makeStore = path.join(root, 'redux', 'store.js') } = reduxConfig;
      return {
        ...meta,
        guides: [{
          name: 'State Management with Redux',
          description: 'Using Redux with Gasket apps',
          link: 'docs/guide.md'
        }],
        lifecycles: [{
          name: 'initReduxState',
          method: 'execWaterfall',
          description: 'Initializes state of the Redux store',
          link: 'README.md#initReduxState',
          parent: 'middleware'
        }, {
          name: 'initReduxStore',
          method: 'exec',
          description: 'Plugin access to Redux store instance',
          link: 'README.md#initReduxStore',
          parent: 'middleware',
          after: 'initReduxState'
        }],
        structures: [{
          name: path.relative(root, makeStore),
          description: 'Setup to make Redux store',
          link: 'README.md'
        }]
      };
    }
  }
};
