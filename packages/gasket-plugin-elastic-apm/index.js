const { filterSensitiveCookies } = require('./lib/cookies');

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
        config.elasticAPM = config.elasticAPM || {};
        // eslint-disable-next-line no-process-env
        config.elasticAPM.active = isActive(config.elasticAPM, process.env);

        return { ...config };
      }
    },
    preboot: {
      handler: async (gasket) => {
        require('elastic-apm-node')
          .start({
            ...gasket.config.elasticAPM
          })
          .addFilter(filterSensitiveCookies(gasket.config));
      }
    }
  }
};
