import inquirer from 'inquirer';
import { withGasketSpinner } from '../with-spinner.js';

/**
 * presetPromptHooks - exec `presetPrompt` hook
 * @type {import('../../internal').presetPromptHooks}
 */
async function presetPromptHooks({ gasket, context }) {
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});

  const nextContext = await gasket.execWaterfall('presetPrompt', context, { prompt });

  Object.assign(context, nextContext);
}

export default withGasketSpinner('Preset prompts', presetPromptHooks, { startSpinner: false });
