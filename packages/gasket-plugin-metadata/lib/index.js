const create = require('./create');
const actions = require('./actions');
const { name, version, description } = require('../package');

module.exports = {
  name,
  version,
  description,
  hooks: {
    create,
    actions,
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
