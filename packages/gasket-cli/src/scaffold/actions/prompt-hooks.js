const inquirer = require('inquirer');
const action = require('../action-wrapper');
const { addPluginsToContext, addPluginsToPkg, getPluginsWithVersions } = require('../utils');
const createEngine = require('../create-engine');

/**
 * Create the `addPlugins` function with context
 *
 * @param {CreateContext} context - Create context
 * @returns {addPlugins} addPlugins
 */
const createAddPlugins = context => {
  /**
   * Allows plugins to add plugins based on user input.
   *
   * @typedef {Function} addPlugins
   *
   * @param {...PluginDesc} pluginsToAdd - Additional plugins to add
   * @returns {Promise} promise
   */
  return async function addPlugins(...pluginsToAdd) {
    const { pkg, pkgLinks = [], pkgManager } = context;

    addPluginsToContext(pluginsToAdd, context);
    const pluginIds = await getPluginsWithVersions(pluginsToAdd, pkgManager);
    addPluginsToPkg(pluginIds, pkg);

    //
    // Install new plugins if not already linked
    //
    const toInstall = pluginIds.filter(p => !pkgLinks.includes(p.fullName));
    if (toInstall.length) {
      await pkgManager.install(toInstall.map(p => p.full));
      //
      // relink because npm blows them away on installs...
      //
      if (pkgLinks.length) {
        await pkgManager.link(pkgLinks);
      }
    }

    await execPluginPrompts(context, pluginIds.map(p => p.shortName));
  };
};

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
async function execPluginPrompts(context, plugins = [], presets = []) {
  const { dest } = context;

  const gasket = await createEngine({ dest, presets, plugins });

  //
  // @see: https://github.com/SBoudrias/Inquirer.js/#inquirercreatepromptmodule---prompt-function
  //
  const prompt = context.prompts ? inquirer.createPromptModule() : () => ({});
  const addPlugins = createAddPlugins(context);

  const nextContext = await gasket.execWaterfall('prompt', context, { prompt, addPlugins });
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
async function promptHooks(context) {
  //
  // Because `execPluginPrompts` is recursively, we need to start it
  // with the processPlugins and presets from our initial context
  //
  const { presets, plugins } = context;
  await execPluginPrompts(context, plugins, presets);
}

module.exports = action('Plugin prompts', promptHooks, { startSpinner: false });
