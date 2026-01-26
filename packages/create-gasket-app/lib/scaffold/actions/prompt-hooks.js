import inquirer from 'inquirer';
import { withGasketSpinner } from '../with-spinner.js';

/**
 * Initializes engine with provided plugins
 * to execute their prompt lifecycle hooks.
 * @type {import('../../internal.js').execPluginPrompts}
 */
async function execPluginPrompts(gasket, context) {
  //
  // @see: https://github.com/SBoudrias/Inquirer.js/#inquirercreatepromptmodule---prompt-function
  //
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});
  const nextContext = await gasket.execWaterfall('prompt', context, { prompt });
  //
  // Ensure the original context is transformed in case a prompt returns a new object
  //
  Object.assign(context, nextContext);
}

/**
 * Executes the `prompt` hook for all registered plugins.
 * Adds `prompt` util function for prompting features.
 * @type {import('../../internal.js').promptHooks}
 */
async function promptHooks({ gasket, context }) {
  //
  // Because `execPluginPrompts` is recursive, we need to start it
  // with the processPlugins from our initial context
  //
  await execPluginPrompts(gasket, context);
}

export default withGasketSpinner('Plugin prompts', promptHooks, { startSpinner: false });
