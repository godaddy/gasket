const middleware = require('./middleware');
const { dependencies } = require('../package.json');

/**
 * Determines if the Elastic APM agent has sufficient config to be active
 * @param {object} config gasket config
 * @param {object<string,any>} env environment variables
 * @returns {boolean} A combined config object
 */
const isActive = (config, env) => {
  const { active } = config;

  if (active || env.ELASTIC_APM_ACTIVE) {
    return true;
  }

  if (env.ELASTIC_APM_SERVER_URL && env.ELASTIC_APM_SECRET_TOKEN) {
    return true;
  }

  return false;
};

module.exports = {
  hooks: {
    configure: {
      handler: async (gasket, config) => {
        config.elasticAPM = config.elasticAPM || {};

        // eslint-disable-next-line no-process-env
        config.elasticAPM.active = isActive(config.elasticAPM, process.env);

        return { ...config };
      }
    },
    preboot: {
      handler: async (gasket) => {
        const { config, logger, command } = gasket;

        if (command && command.id === 'local') return;

        // prefer app-level dependency in case of duplicates
        const apm = require(
          require.resolve('elastic-apm-node', { paths: [config.root, __dirname] })
        );

        if (!apm.isStarted()) {
          logger.notice('WARNING Elastic APM agent is not started. Use `--require ./setup.js`');
        }

        if (config.elasticAPM && config.elasticAPM.sensitiveCookies) {
          logger.notice('WARNING: elasticAPM.sensitiveCookies has been removed. Filter sensitive data in the setup.js script.');
        }
      }
    },
    create: {
      timing: {
        after: ['@gasket/plugin-start']
      },
      handler(gasket, { pkg, files }) {
        const generatorDir = `${ __dirname }/../generator`;

        pkg.add('dependencies', {
          'elastic-apm-node': dependencies['elastic-apm-node'],
          'dot-env': dependencies['dot-env']
        });
        pkg.add('scripts', {
          start: 'gasket start --require ./setup.js'
        });

        files.add(`${generatorDir}/*`);
      }
    },
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [{
          name: 'apmTransaction',
          method: 'exec',
          description: 'Modify the APM transaction',
          link: 'README.md#apmtransaction',
          parent: 'middleware'
        }]
      };
    }
  }
};
