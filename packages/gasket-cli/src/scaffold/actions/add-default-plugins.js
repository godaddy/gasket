const action = require('../action-wrapper');
const { addPluginsToPkg, addPluginsToContext } = require('../plugin-utils');
const defaultPlugins = require('../default-plugins.js');

/**
 * Adds default plugins to the application
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function addDefaultPlugins(context) {
  const { pkg } = context;
  addPluginsToPkg(defaultPlugins, pkg);
  addPluginsToContext(defaultPlugins, context);
}

module.exports = action('Add default plugins', addDefaultPlugins);
