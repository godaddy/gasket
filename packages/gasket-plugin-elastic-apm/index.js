const { filterSensitiveCookies } = require('./lib/cookies');

/**
 * Determines if the Elastic APM agent has sufficient config to be active
 * @param {object} config gasket config
 * @param {object<string,any>} env environment variables
 * @returns {boolean} A combined config object
 */
const isActive = (config, env) => {
  const { serverUrl, secretToken } = config || {};

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
    preboot: {
      handler: async ({ config }) => {
        require('elastic-apm-node')
          .start({
            // eslint-disable-next-line no-process-env
            active: isActive(config.elasticAPM || {}, process.env),
            ...config.elasticAPM
          })
          .addFilter(filterSensitiveCookies(config));
      }
    }
  }
};
