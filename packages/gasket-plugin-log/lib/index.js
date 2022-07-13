/* eslint require-atomic-updates: warn */
const { name, dependencies } = require('../package');

/**
 * Expose the plugin hooks, listen to the `init` and `destroy` events.
 *
 * @type {object}
 */
module.exports = {
  name,
  hooks: {
    init: {
      // init after the @gasket/lifecycle-plugin to allow a `logTransports`
      // file to be define in an app's `./lifecycles` dir.
      timing: {
        after: ['@gasket/plugin-lifecycle']
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
        '@gasket/log': dependencies['@gasket/log']
      });
    },

    async destroy(gasket) {
      await gasket.logger.close();
    },

    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'logTransports',
          method: 'exec',
          description: 'Setup Winston log transports',
          link: 'README.md#logTransports',
          parent: 'init'
        }],
        configurations: [{
          name: 'log',
          link: 'README.md#configuration',
          description: 'Setup and customize logger',
          type: 'object'
        }, {
          name: 'log.prefix',
          link: 'README.md#configuration',
          description: 'Used to set the prefix in the winston format',
          type: 'string'
        }, {
          name: 'winston',
          link: 'README.md#configuration',
          description: 'Setup and customize winston logger',
          type: 'object'
        }]
      };
    }
  }
};
