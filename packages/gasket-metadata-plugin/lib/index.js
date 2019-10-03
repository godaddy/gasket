const cloneDeep = require('lodash.clonedeep');
const isObject = require('lodash.isobject');
const { pluginIdentifier, presetIdentifier } = require('@gasket/resolve');
const { sanitize, expand } = require('./utils');

const isPlugin = name => pluginIdentifier.isValidFullName(name);
const isPreset = name => presetIdentifier.isValidFullName(name);

/**
 * Load moduleData for app dependencies
 *
 * @param {Loader} loader - Loader instance
 * @param {ModuleData} app - Metadata for app
 * @param {ModuleData[]} modules - Metadata for modules
 */
function loadAppModules(loader, app, modules) {
  Object.keys(app.package.dependencies)
    .filter(name => !isPlugin(name) && !isPreset(name))
    .forEach(name => {
      const range = app.package.dependencies[name];
      const moduleData = loader.getModuleInfo(null, name, { from: app.name, range });
      modules.push(moduleData);
    });
}

/**
 * Load moduleData for any supporting modules that are declared by plugin
 *
 * @param {PluginData} pluginData - Metadata for a plugin
 * @param {Loader} loader - Loader instance
 */
function loadPluginModules(pluginData, loader) {
  if (pluginData.modules) {
    pluginData.modules = pluginData.modules
      .map(mod => isObject(mod) ? mod : { name: mod })  // normalize string names to objects
      .map(mod => loader.getModuleInfo(null, mod.name, mod));
  }
}

/**
 * Flatten moduleData from plugin to top-level modules metadata
 *
 * @param {PluginData} pluginData - Metadata for a plugin
 * @param {ModuleData[]} modules - Metadata for modules
 */
function flattenPluginModules(pluginData, modules) {
  if (pluginData.modules) {
    pluginData.modules.forEach(moduleData => {
      const existing = modules.find(mod => mod.name === moduleData.name);
      if (existing) {
        expand(existing, moduleData);
      } else {
        modules.push(moduleData);
      }
    });
  }
}

/**
 * Assign modified plugin data instances back to preset hierarchy to avoid faulty data
 *
 * @param {PluginData} pluginData - Metadata for a plugin
 * @param {ModuleData[]} presets - Metadata for presets
 */
function fixupPresetHierarchy(pluginData, presets) {

  /**
   * Recursing fixer-upper
   *
   * @param {PresetData} presetData - Preset to fixup
   */
  function checkPreset(presetData) {
    if (presetData.name === pluginData.from) {
      const idx = presetData.plugins.findIndex(p => p.name === pluginData.name);
      presetData.plugins[idx] = pluginData;
    }
    presetData.presets && presetData.presets.forEach(checkPreset);
  }

  presets.forEach(checkPreset);
}

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const { loader, config } = gasket;
      const { root = process.cwd() } = config;
      const loaded = loader.loadConfigured(config.plugins);
      const { presets, plugins } = sanitize(cloneDeep(loaded));
      const app = loader.getModuleInfo(null, root);
      const modules = [];

      /**
       * @type {Metadata}
       */
      gasket.metadata = {
        app,
        presets,
        plugins,
        modules
      };

      loadAppModules(loader, app, modules);

      //
      // Allow plugins to tune their own metadata via lifecycle
      //
      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginData = await handler(plugins[idx]);

        loadPluginModules(pluginData, loader);
        flattenPluginModules(pluginData, modules);
        fixupPresetHierarchy(pluginData, presets);

        // eslint-disable-next-line require-atomic-updates
        plugins[idx] = pluginData;
      });
    },
    metadata(gasket, pluginData) {
      return {
        ...pluginData,
        lifecycles: [{
          name: 'metadata',
          method: 'execApply',
          description: 'Allows plugins to adjust their metadata',
          link: 'README.md#metadata'
        }]
      };
    }
  }
};
