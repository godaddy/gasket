const { filterSensitiveCookies } = require('./cookies');
const middleware = require('./middleware');
const { devDependencies } = require('../package.json');

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
      handler: (gasket, config) => {
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
        const apm = require(require.resolve('elastic-apm-node', {
          paths: [config.root, __dirname]
        }));

        if (!apm.isStarted()) {
          logger.warn(
            'Elastic APM agent is not started. Use `--require ./setup.js`'
          );
        }

        apm.addFilter(filterSensitiveCookies(config));
      }
    },
    create: {
      timing: {
        after: ['@gasket/plugin-start']
      },
      handler(gasket, { pkg, files }) {
        const generatorDir = `${__dirname}/../generator`;

        pkg.add('dependencies', {
          'elastic-apm-node': devDependencies['elastic-apm-node'],
          'dotenv': devDependencies.dotenv
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
        configurations: [
          {
            name: 'elasticAPM',
            link: 'README.md#configuration',
            description: 'Configuration to provide additional setup helpers',
            type: 'object'
          },
          {
            name: 'elasticAPM.sensitiveCookies',
            link: 'README.md#configuration',
            description: 'List of sensitive cookies to filter',
            type: 'string[]',
            default: '[]'
          }
        ],
        lifecycles: [
          {
            name: 'apmTransaction',
            method: 'exec',
            description: 'Modify the APM transaction',
            link: 'README.md#apmtransaction',
            parent: 'middleware'
          }
        ]
      };
    }
  }
};
