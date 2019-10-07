/* eslint require-atomic-updates: warn */
/**
 * Expose the plugin hooks, listen to the `init` and `destroy` events.
 *
 * @type {object}
 */
module.exports = {
  name: 'log',
  hooks: {
    init: {
      timing: {
        after: ['lifecycle']
      },
      handler: async function init(gasket) {
        const { config, command } = gasket;

        const options = {
          transports: [],
          ...config.winston,
          ...config.log,
          local: config.env === 'local' || (command.id || command) !== 'start',
          exitOnError: true
        };

        const transports = await gasket.exec('logTransports');
        if (Array.isArray(transports) && transports.length) {
          // flatten and include transports gathered from the lifecycle
          options.transports = transports.reduce((acc, val) => acc.concat(val).filter(Boolean), options.transports);
        }

        const Log = require('@gasket/log');
        gasket.logger = new Log(options);
      }
    },

    async create(gasket, { pkg }) {
      pkg.add('dependencies', {
        '@gasket/log': '^3.0.0'
      });
    },

    async destroy(gasket) {
      await gasket.logger.close();
    }
  }
};
