const DocsConfigSetBuilder = require('./config-set-builder');
const defaults = DocsConfigSetBuilder.docsSetupDefault;

/**
 * Searches for the pluginData from metadata for a given plugin.
 * If the plugin does not have a name, a unique match by hooks is attempted,
 * otherwise a console warning is issued.
 *
 * @param {Plugin} plugin - Plugin instance to look up info for
 * @param {PluginData[]} pluginsDatas - Metadata for plugins
 * @param {Log} logger - log instance
 * @returns {PluginData|undefined} pluginsData
 */
function findPluginData(plugin, pluginsDatas, logger) {
  const { name } = plugin;
  // If the plugin does not have a name, try to find a unique hooks match
  if (!name) {
    const expectedHooks = Object.keys(plugin.hooks);
    const results = pluginsDatas.filter(pluginData => {
      const actual = Object.keys(pluginData.module.hooks);
      return expectedHooks.length === actual.length && actual.every(k => expectedHooks.includes(k));
    });
    if (!results.length) {
      logger.error(`Plugin missing name. Unable to find pluginData with hooks: ${JSON.stringify(expectedHooks)}`);
    } else if (results.length > 1) {
      logger.error(`Plugin missing name. More than one pluginData with hooks: ${JSON.stringify(expectedHooks)}`);
    } else {
      logger.info(`Determined plugin with missing name to be: ${results[0].name}`);
      return results[0];
    }
  } else {
    const results = pluginsDatas.find(p => p.module.name === name || p.name === name);
    if (!results) {
      logger.error(`Unable to find pluginData for: ${name}`);
    }
    return results;
  }
}

/**
 * Processes metadata and docsSetup hooks to assemble the set of docs configs
 *
 * Order of operations for building docsConfig:
 *   - docsSetup hooked plugins
 *   - metadata or docsSetup lifecycle file for app
 *   - metadata for plugins without docsSetup hook
 *   - metadata for modules not processed with plugins
 *   - metadata for presets
 *
 * @param {Gasket} gasket - Gasket API
 * @returns {DocsConfigSet} docsConfigSet
 */
async function buildDocsConfigSet(gasket) {
  const { metadata, logger } = gasket;
  const { app: appData } = metadata;
  const builder = new DocsConfigSetBuilder(gasket);

  await gasket.execApply('docsSetup', async (plugin, handler) => {
    // console.log(plugin);
    //
    // If this is a lifecycle file, use it to modify the app-level docConfig
    //
    if (!plugin) {
      const docsSetup = await handler({ defaults });
      return await builder.addApp(appData, docsSetup);
    }

    const pluginData = buildDocsConfigSet.findPluginData(plugin, metadata.plugins, logger);
    if (pluginData) {
      // console.log(pluginData);
      const docsSetup = await handler({ defaults });
      await builder.addPlugin(pluginData, docsSetup);
    }
  });

  await builder.addApp(appData);
  await builder.addPlugins(metadata.plugins);
  await builder.addModules(metadata.modules);
  await builder.addPresets(metadata.presets);

  return builder.getConfigSet();
}

buildDocsConfigSet.findPluginData = findPluginData;

module.exports = buildDocsConfigSet;
