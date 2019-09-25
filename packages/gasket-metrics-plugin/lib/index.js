const Metrics = require('./metrics');

module.exports = {
  name: 'metrics',
  dependencies: ['metadata'],
  hooks: {
    init: {
      timing: {
        after: 'metadata'
      },
      handler: async function init(gasket) {
        const metrics = new Metrics(gasket);

        // we don't await this call so we don't block anything
        metrics.report()
          .then(data => gasket.exec('metrics', data))
          .catch(this.error);
      }
    }
  }
};
