const Metrics = require('./metrics');
const { name } = require('../package');

module.exports = {
  name,
  dependencies: ['@gasket/plugin-metadata'],
  hooks: {
    init: {
      timing: {
        after: ['@gasket/plugin-metadata']
      },
      handler: async function init(gasket) {
        const { logger = console } = gasket;

        const metrics = new Metrics(gasket);

        // we don't await this call so we don't block anything
        metrics.report()
          .then(data => gasket.exec('metrics', data))
          .catch(err => {
            logger.error(err.message || `${err}`);
          });
      }
    },
    /**
     * Option that is applied to all commands at the `gasket` level
     */
    async getCommandOptions() {
      return [
        {
          name: 'record',
          description: `${name}: Whether or not to emit this command as part of Gasket\'s metrics lifecycle`,
          default: true
        }
      ];
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'metrics',
          method: 'exec',
          description: 'Collect metrics for an app',
          link: 'README.md#metrics',
          parent: 'init'
        }]
      };
    }
  }
};
