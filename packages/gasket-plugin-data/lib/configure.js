const { applyConfigOverrides } = require('@gasket/utils/apply-config-overrides');
const { baseDataMap } = require('./actions');

/**
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
function configure(gasket, baseConfig) {
  const { command, config: { env } } = gasket;
  const commandId = command && command.id;
  if ('data' in baseConfig) {
    const data = applyConfigOverrides(
      baseConfig.data,
      { env, commandId }
    );

    baseDataMap.set(gasket.symbol, data);

    //
    // remove definition from config
    // access via actions allowing async fixup
    //
    delete baseConfig.data;
  }

  return baseConfig;
}

module.exports = configure;
