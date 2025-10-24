/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-command" />

import { applyConfigOverrides } from '@gasket/utils';
import { baseDataMap } from './actions.js';

/**
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, baseConfig) {
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
