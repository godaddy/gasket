import inquirer from 'inquirer';
import action from '../action-wrapper.js';

/**
 * presetPromptHooks - exec `presetPrompt` hook
 * @param {Gasket} gasket - Preset gasket instance
 * @param {CreateContext} context - Create context
 */
async function presetPromptHooks({ gasket, context }) {
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});

  const nextContext = await gasket.execWaterfall('presetPrompt', context, { prompt });

  Object.assign(context, nextContext);
}

export default action('Preset prompts', presetPromptHooks, { startSpinner: false });
