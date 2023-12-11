import path from 'path';
import { default as pkg } from '../package.json' assert { type: "json" };
const { name, devDependencies } = pkg;
import configure from './configure.js';
import prompt from './prompt.js';
import middleware from './middleware.js';

/**
 * Gasket Redux Plugin
 *
 * Adds middleware to the express server with webpack configuration
 *
 * @type {{hooks: {middleware, webpack}}}
 */
export default {
  name,
  dependencies: ['@gasket/plugin-log'],
  hooks: {
    configure,
    prompt,
    async create(gasket, context) {
      const { pkg, files } = context;
      const generatorDir = `${ __dirname }/../generator`;

      pkg.add('dependencies', {
        '@gasket/redux': devDependencies['@gasket/redux'],
        'react-redux': devDependencies['react-redux'],
        'redux': devDependencies.redux
      });

      files.add(
        `${ generatorDir }/*`,
        `${ generatorDir }/**/*`
      );

      context.hasGasketRedux = true;
    },
    webpackConfig(gasket, webpackConfig, { webpack }) {
      const { redux: reduxConfig } = gasket.config;

      return {
        ...webpackConfig,
        plugins: [
          ...(webpackConfig.plugins || []),
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
        }],
        configurations: [{
          name: 'redux',
          link: 'README.md#configuration',
          description: 'Redux plugin config object',
          type: 'object'
        }, {
          name: 'redux.makeStore',
          link: 'README.md#configuration',
          description: 'Relative path to a custom makeStore configuration',
          type: 'string',
          default: 'store.js'
        }, {
          name: 'redux.initState',
          link: 'README.md#configuration',
          description: 'Initial state to include in the store',
          type: 'object'
        }]
      };
    }
  }
};
