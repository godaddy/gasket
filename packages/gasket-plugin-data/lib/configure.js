const { applyConfigOverrides } = require('@gasket/utils/config');
const { baseDataMap } = require('./actions');

/**
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
function configure(gasket, baseConfig) {
  const { config: { env, command } } = gasket;
  if ('data' in baseConfig) {
    const data = applyConfigOverrides(
      baseConfig.data,
      { env, commandId: command }
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
