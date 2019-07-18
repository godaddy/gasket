/**
 * Expose the plugin hooks, listen to the `init` and `destroy` events.
 *
 * @type {object}
 */
module.exports = {
  name: 'log',
  hooks: {
    async init(gasket) {
      const { config } = gasket;

      const options = {
        transports: [],
        ...config.winston,
        ...config.log,
        local: config.env === 'local' || gasket.command !== 'start',
        exitOnError: true
      };

      const transports = await gasket.exec('logTransports');
      if (Array.isArray(transports) && transports.length) {
        options.transports = options.transports.concat(transports);
      }

      const Log = require('@gasket/log');
      gasket.logger = new Log(options);
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
