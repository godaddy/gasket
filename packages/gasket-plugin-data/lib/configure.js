const { applyConfigOverrides } = require('@gasket/utils');
const { baseDataMap } = require('./actions');

/**
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
function configure(gasket, baseConfig) {
  const { command, config: { env, root } } = gasket;
  const commandId = command && command.id;
  if ('data' in baseConfig) {
    const data = applyConfigOverrides(
      baseConfig.data,
      { env, commandId, root }
    );

    baseDataMap.set(gasket, data);

    //
    // remove definition from config
    // access via actions allowing async fixup
    //
    delete baseConfig.data;
  }

  return baseConfig;
}

module.exports = configure;
