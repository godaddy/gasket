import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import actions from './actions.js';
import webpackConfig from './webpack-config.js';
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default ({
  name,
  version,
  description,
  actions,
  hooks: {
    webpackConfig,
    metadata(gasket, meta) {
      const mod = require('@gasket/core/package.json');
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
            name: mod.name,
            version: mod.version,
            description: mod.description,
            link: 'README.md'
          }
        ]
      };
    }
  }
});
