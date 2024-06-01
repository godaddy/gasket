const { applyConfigOverrides } = require('@gasket/utils');

/**
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
function configure(gasket, config) {
  const { command: { id: commandId }, config: { env, root } } = gasket;

  if ('data' in config) {
    config.data = applyConfigOverrides(
      config.data,
      { env, commandId, root }
    );
  }

  return config;
}

module.exports = configure;
