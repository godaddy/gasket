/// <reference types="@gasket/plugin-command" />

const isDefined = (o) => typeof o !== 'undefined';

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

/** @type {import('@gasket/engine').HookHandler<'configure'>} */
module.exports = async function configure(gasket, config) {
  const { logger } = gasket;
  config.elasticAPM = config.elasticAPM || {};

  const { serverUrl, secretToken } = config.elasticAPM;
  if (isDefined(serverUrl)) {
    logger.notice(
      'DEPRECATED config `elasticAPM.serverUrl`. Use env var: ELASTIC_APM_SERVER_URL'
    );
  }
  if (isDefined(secretToken)) {
    logger.notice(
      'DEPRECATED config `elasticAPM.secretToken`. Use env var: ELASTIC_APM_SECRET_TOKEN'
    );
  }

  // eslint-disable-next-line no-process-env
  config.elasticAPM.active = isActive(config.elasticAPM, process.env);

  return { ...config };
};
