const Metrics = require('./metrics');

module.exports = {
  name: require('../package').name,
  dependencies: ['@gasket/plugin-metadata'],
  hooks: {
    init: {
      timing: {
        after: ['@gasket/plugin-metadata']
      },
      handler: function init(gasket) {
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
