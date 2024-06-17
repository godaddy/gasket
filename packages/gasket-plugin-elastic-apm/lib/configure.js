/**
 * Determines if the Elastic APM agent has sufficient config to be active
 * @param {import('./index').ExtendedAgentConfigOptions} config Apm agent config
 * @param {NodeJS.ProcessEnv} env Environment variables
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

/** @type {import('@gasket/core').HookHandler<'configure'>} */
module.exports = function configure(gasket, config) {
  config.elasticAPM = config.elasticAPM || {};

  // eslint-disable-next-line no-process-env
  config.elasticAPM.active = isActive(config.elasticAPM, process.env);

  return { ...config };
};
