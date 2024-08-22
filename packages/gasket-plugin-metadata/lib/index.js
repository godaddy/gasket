const create = require('./create');
const actions = require('./actions');
const webpackConfig = require('./webpack-config');
const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
module.exports = {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    webpackConfig,
    metadata(gasket, meta) {
      const mod = require('@gasket/core/package.json');
      return {
        ...meta,
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
};
