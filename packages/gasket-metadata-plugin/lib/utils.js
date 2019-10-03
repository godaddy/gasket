const isFunction = require('lodash.isfunction');
const isObject = require('lodash.isobject');
const { pluginIdentifier, presetIdentifier } = require('@gasket/resolve');

// Shortcuts
const isPlugin = name => pluginIdentifier.isValidFullName(name);
const isPreset = name => presetIdentifier.isValidFullName(name);

/**
 * Recurse through an object or array, and transforms, by mutation,
 * any functions to be empty.
 *
 * @param {Object|Array} value - Item to consider
 * @returns {Object|Array} transformed result
 * @private
 */
function sanitize(value) {
  if (isFunction(value)) {
    return function redacted() {};
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([k, v]) => {
      value[k] = sanitize(v);
    });
  }

  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      value[i] = sanitize(v);
    });
  }

  return value;
}

/**
 * Add keys to from other object to the target if not present
 *
 * @param {Object} target - Object to mutate
 * @param {Object} other - Object to pull from
 */
function safeAssign(target, other) {
  Object.keys(other)
    .reduce((acc, key) => {
      if (!(key in acc)) acc[key] = other[key];
      return acc;
    }, target);
}

/**
 * Load moduleData for app dependencies
 *
 * @param {Loader} loader - Loader instance
 * @param {ModuleData} app - Metadata for app
 * @param {ModuleData[]} modules - Metadata for modules
 */
function loadAppModules(loader, app, modules) {
  app.modules = app.modules || [];
  Object.keys(app.package.dependencies)
    .filter(name => !isPlugin(name) && !isPreset(name))
    .forEach(name => {
      const range = app.package.dependencies[name];
      const moduleData = loader.getModuleInfo(null, name, { from: app.name, range });
      app.modules.push(moduleData);
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
        safeAssign(existing, moduleData);
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
  function fixup(presetData) {
    if (presetData.name === pluginData.from) {
      const idx = presetData.plugins.findIndex(p => p.name === pluginData.name);
      presetData.plugins[idx] = pluginData;
    }
    presetData.presets && presetData.presets.forEach(fixup);
  }

  presets.forEach(fixup);
}

module.exports = {
  sanitize,
  safeAssign,
  loadAppModules,
  loadPluginModules,
  flattenPluginModules,
  fixupPresetHierarchy
};
