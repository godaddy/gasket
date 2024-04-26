import action from '../action-wrapper.js';

async function presetConfigHooks(gasket, context) {
  if (!context.presetConig) {
    context.presetConfig = {};
  }

  const config = await gasket.execWaterfall('presetConfig', context);

  Object.assign(context.presetConfig, config);
}

export default action('Preset Config', presetConfigHooks, { startSpinner: false });
