import create from './create.js';
import actions from './actions.js';
import webpackConfig from './webpack-config.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;
import corePackageJson from '@gasket/core/package.json' with { type: 'json' };

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
      const mod = corePackageJson;
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
