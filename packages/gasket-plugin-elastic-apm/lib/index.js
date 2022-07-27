const { filterSensitiveCookies } = require('./cookies');
const middleware = require('./middleware');
const { dependencies } = require('../package.json');

const isDefined = o => typeof o !== 'undefined';

/**
 * Determines if the Elastic APM agent has sufficient config to be active
 * @param {object} config gasket config
 * @param {object<string,any>} env environment variables
 * @returns {boolean} A combined config object
 */
const isActive = (config, env) => {
  const { active, serverUrl, secretToken } = config;

  if (active || env.ELASTIC_APM_ACTIVE) {
    return true;
  }

  const combined = {
    serverUrl: serverUrl || env.ELASTIC_APM_SERVER_URL,
    secretToken: secretToken || env.ELASTIC_APM_SECRET_TOKEN
  };

  if (combined.serverUrl && combined.secretToken) {
    return true;
  }

  return false;
};

module.exports = {
  hooks: {
    configure: {
      handler: async (gasket, config) => {
        const { logger } = gasket;
        config.elasticAPM = config.elasticAPM || {};

        const { serverUrl, secretToken } = config.elasticAPM;
        if (isDefined(serverUrl)) {
          logger.notice('DEPRECATED config `elasticAPM.serverUrl`. Use env var: ELASTIC_APM_SERVER_URL');
        }
        if (isDefined(secretToken)) {
          logger.notice('DEPRECATED config `elasticAPM.secretToken`. Use env var: ELASTIC_APM_SECRET_TOKEN');
        }

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
          apm.start({
            ...config.elasticAPM
          });
          logger.notice('DEPRECATED started Elastic APM agent late. Use `--require elastic-apm-node/start`');
        }

        apm.addFilter(filterSensitiveCookies(config));
      }
    },
    create: {
      timing: {
        after: ['@gasket/plugin-start']
      },
      handler(gasket, { pkg }) {
        pkg.add('dependencies', {
          'elastic-apm-node': dependencies['elastic-apm-node']
        });
        pkg.add('scripts', {
          start: 'gasket start --require elastic-apm-node/start'
        });
      }
    },
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [{
          name: 'elasticAPM',
          link: 'README.md#configuration',
          description: 'Configuration to provide additional setup helpers',
          type: 'object'
        }, {
          name: 'elasticAPM.sensitiveCookies',
          link: 'README.md#configuration',
          description: 'List of sensitive cookies to filter',
          type: 'string[]',
          default: '[]'
        }],
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
