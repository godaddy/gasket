import action from '../action-wrapper.js';

/**
 * presetConfigHooks - exec `presetConfig` hook
 * @type {import('../../internal').presetConfigHooks}
 */
async function presetConfigHooks({ gasket, context }) {
  const config = await gasket.execWaterfall('presetConfig', context);
  Object.assign(context.presetConfig, config);
}

export default action('Preset Config', presetConfigHooks, { startSpinner: false });
