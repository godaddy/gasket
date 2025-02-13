import { withGasketSpinner } from '../with-spinner.js';

/**
 * presetConfigHooks - exec `presetConfig` hook
 * @type {import('../../internal').presetConfigHooks}
 */
async function presetConfigHooks({ gasket, context }) {
  const config = await gasket.execWaterfall('presetConfig', context);
  Object.assign(context.presetConfig, config);
}

export default withGasketSpinner('Preset Config', presetConfigHooks, { startSpinner: false });
