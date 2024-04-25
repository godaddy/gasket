import inquirer from 'inquirer';
import action from '../action-wrapper.js';


async function presetPromptHooks(gasket, context) {
  console.log(context.prompts)
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});

  const nextContext = await gasket.execWaterfall('presetPrompt', context, { prompt });

  Object.assign(context, nextContext);
}

export default action('Preset prompts', presetPromptHooks, { startSpinner: false });
