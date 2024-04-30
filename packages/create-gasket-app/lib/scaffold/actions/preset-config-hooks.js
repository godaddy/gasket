import action from '../action-wrapper.js';

/**
 * presetConfigHooks - exec `presetConfig` hook
 * @param {Gasket} gasket - Preset gasket instance
 * @param {CreateContext} context - Create context
 */
async function presetConfigHooks(gasket, context) {
  const config = await gasket.execWaterfall('presetConfig', context);
  Object.assign(context.presetConfig, config);
}

export default action('Preset Config', presetConfigHooks, { startSpinner: false });
