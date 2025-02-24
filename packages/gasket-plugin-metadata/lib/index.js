import create from './create.js';
import actions from './actions.js';
import webpackConfig from './webpack-config.js';
import pkg from '../package.json' with { type: 'json' };
import corePkg from '@gasket/core/package.json' with { type: 'json' };
const { name, version, description } = pkg;

/** @type {import('@gasket/core').Plugin} */
export default ({
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    webpackConfig,
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getMetadata',
            description: 'Get the metadata for the plugins & modules',
            link: 'README.md#getMetadata'
          }
        ],
        lifecycles: [{
          name: 'metadata',
          method: 'execApply',
          description: 'Allows plugins to adjust their metadata',
          link: 'README.md#metadata',
          parent: 'init'
        }],
        modules: [
          {
            name: corePkg.name,
            version: corePkg.version,
            description: corePkg.description,
            link: 'README.md'
          }
        ]
      };
    }
  }
});
