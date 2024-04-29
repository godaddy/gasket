import inquirer from 'inquirer';
import action from '../action-wrapper.js';
// TODO - adjust types
/**
 * Initializes engine with provide preset and plugins
 * to execute their prompt lifecycle hooks.
 *
 * @param {CreateContext} context - Create context
 * @param {String[]} plugins - plugins to load
 * @param {String} [presets] - presets to load
 * @returns {Promise} promise
 * @private
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
 * Adds `prompt` and `addPlugins` util functions for prompting features.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function promptHooks(gasket, context) {
  //
  // Because `execPluginPrompts` is recursively, we need to start it
  // with the processPlugins and presets from our initial context
  //
  const { plugins } = context;
  await execPluginPrompts(gasket, context, plugins);
}

export default action('Plugin prompts', promptHooks, { startSpinner: false });
