const inquirer = require('inquirer');
const path = require('path');
const PluginEngine = require('@gasket/plugin-engine');
const action = require('../action-wrapper');
const PackageManager = require('../package-manager');
const { addPluginsToContext, addPluginsToPkg } = require('../plugin-utils');
const { pluginIdentifier } = require('../package-identifier');

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
    const { pkg, pkgLinks = [] } = context;

    addPluginsToContext(pluginsToAdd, context);
    addPluginsToPkg(pluginsToAdd, pkg);

    //
    // Install new plugins if not already linked
    //
    const pluginIds = pluginsToAdd.map(p => pluginIdentifier(p).withVersion());
    const manager = new PackageManager(context);
    const toInstall = pluginIds.filter(p => !pkgLinks.includes(p.fullName));
    if (toInstall.length) {
      await manager.install(toInstall.map(p => p.full));
      //
      // relink because npm blows them away on installs...
      //
      if (pkgLinks.length) {
        await manager.link(pkgLinks);
      }
    }

    await execPluginPrompts(context, pluginIds.map(p => p.shortName));
  };
};

/**
 * Initializes plugin-engine with provide preset and plugins
 * to execute their prompt lifecycle hooks.
 *
 * @param {CreateContext} context - Create context
 * @param {String[]} targetPlugins - plugins to load
 * @param {String} [targetPresets] - presets to load
 * @returns {Promise} promise
 * @private
 */
async function execPluginPrompts(context, targetPlugins = [], targetPresets = []) {
  const { dest } = context;

  const resolveFrom = path.join(dest, 'node_modules');
  const engineConfig = {
    plugins: {
      presets: targetPresets,
      add: targetPlugins
    }
  };

  const gasket = new PluginEngine(engineConfig, { resolveFrom });

  //
  // @see: https://github.com/SBoudrias/Inquirer.js/#inquirercreatepromptmodule---prompt-function
  //
  const prompt = inquirer.createPromptModule();
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
  const { presets: targetPresets, plugins: targetPlugins } = context;
  await execPluginPrompts(context, targetPlugins, targetPresets);
}

module.exports = action('Plugin prompts', promptHooks, { startSpinner: false });
