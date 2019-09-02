const path = require('path');
const flatten  = require('./flatten');
const Resolver  = require('./resolver');
const { pluginIdentifier, presetIdentifier } = require('./package-identifier');

/**
 * Module with meta data
 *
 * @typedef {Object} ModuleInfo
 *
 *
 * @property {String} name - Name of preset
 * @property {String} shortName - Short Name of preset
 * @property {String} module - Actual module content
 * @property {String} [version] - Resolved version
 * @property {String} [package] - Package.json contents
 * @property {String} [path] - path to the root of package
 * @property {String} [from] - Name of module requires this module
 * @property {String} [range] - Range by which this module was required
 */

/**
 * Plugin module with meta data
 *
 * @typedef {ModuleInfo} PluginInfo
 */

/**
 * Preset module with meta data
 *
 * @typedef {ModuleInfo} PresetInfo
 * @property {PresetInfo[]} presets - Presets that this preset extends
 * @property {PluginInfo[]} plugins - Plugins this preset uses
 */


/**
 * Test if module appears to be a path name.
 *
 * @type {RegExp}
 */
const isModulePath = /^[/.]|node_modules/;

/**
 * Utility to load plugins, presets, and other modules with metadata
 *
 * @type {Resolver}
 */
module.exports = class Loader extends Resolver {

  constructor() {
    super(...arguments);
  }

  /**
   * Loads a module with additional metadata
   *
   * @param {String} module - Module content
   * @param {String} moduleName - Name of module to load
   * @param {Object} [meta] - Additional meta data
   * @returns {ModuleInfo} module
   */
  getModuleInfo(module, moduleName, meta = {}) {
    const info = {
      name: moduleName,
      module,
      ...meta
    };

    const pkgPath = this.tryResolve(`${moduleName}/package.json`);
    if (pkgPath) {
      info.path = path.dirname(pkgPath);
      info.package = this.require(pkgPath);
      info.version = info.package.version;
      info.name = info.package.name;
    }

    return info;
  }

  /**
   * Loads a module with additional metadata
   *
   * @param {String} moduleName - Name of module to load
   * @param {Object} [meta] - Additional meta data
   * @returns {ModuleInfo} module
   */
  loadModule(moduleName, meta = {}) {
    const module = this.require(moduleName);
    return this.getModuleInfo(module, moduleName, meta);
  }

  /**
   * Loads a preset with additional metadata
   *
   * @param {String} module - Name of module to load
   * @param {Object} [meta] - Additional meta data
   * @param {Boolean} [options] - Loading options
   * @param {Boolean} [options.shallow] - Do not recursively load dependencies
   * @returns {PresetInfo} module
   */
  loadPreset(module, meta, { shallow = false } = {}) {
    const moduleName = isModulePath.test(module) ? module : presetIdentifier(module).fullName;
    const presetInfo = this.loadModule(moduleName, meta);

    const { name: from, dependencies } = presetInfo.package;

    // If this preset provided a require instance, use it for its plugins
    const presetResolver = presetInfo.module.require ? new Loader({ require: presetInfo.module.require }) : this;

    // filter out a list of presets and plugins from dependencies
    const presetNames = Object.keys(dependencies).filter(k => presetIdentifier.isValidFullName(k));
    const pluginNames = Object.keys(dependencies).filter(k => pluginIdentifier.isValidFullName(k));

    let presets;
    let plugins;
    if (shallow) {
      presets = presetNames.map(name => presetResolver.getModuleInfo(null, name, { from, range: dependencies[name] }));
      plugins = pluginNames.map(name => presetResolver.getModuleInfo(null, name, { from, range: dependencies[name] }));
    } else {
      presets = presetNames.map(name => presetResolver.loadPreset(name, { from, range: dependencies[name] }));
      plugins = pluginNames.map(name => presetResolver.loadPlugin(name, { from, range: dependencies[name] }));
    }

    return {
      ...presetInfo,
      plugins,
      presets
    };
  }

  /**
   * Loads a plugin with additional metadata.
   *
   * @param {String|Object} module - Name of module to load (or module content)
   * @param {Object} [meta] - Additional meta data
   * @returns {PluginInfo} module
   */
  loadPlugin(module, meta = {}) {
    // If the provide plugin is an already required module, just gather info.
    if (typeof module !== 'string') {
      const moduleName = pluginIdentifier(module.name).fullName;
      return this.getModuleInfo(module, moduleName, { meta, preloaded: true });
    }

    const moduleName = isModulePath.test(module) ? module : pluginIdentifier(module).fullName;
    return this.loadModule(moduleName, meta);
  }

  /**
   * Loads presets and plugins as configured.
   * .plugins will be filtered and ordered as configuration with priority of:
   *  - added plugins > preset plugins > nested preset plugins
   *
   * @param {Object}            config         - Presets and plugins to load
   * @param {string[]}          config.presets - Presets to load and add plugins from
   * @param {string[]|module[]} config.add     - Names of plugins to load
   * @param {string[]}          config.remove  - Names of plugins to remove (from presets)
   * @returns {{presets: PresetInfo[], plugins: PluginInfo[]}} results
   */
  loadConfigured(config) {
    const { presets = [], add = [], remove = [] } = config || {};
    const pluginsToRemove = new Set(remove.map(name => pluginIdentifier(name).fullName) || []);

    const loadedPresets = flatten(presets).map(name => this.loadPreset(name, { from: 'config' }));
    const loadedPlugins = add.map(module => this.loadPlugin(module, { from: 'config' }));

    let plugins = [];

    // recursively get plugins from presets
    function pullPlugins(preset) {
      plugins.push(...preset.plugins);
      if (Array.isArray(preset.presets)) {
        preset.presets.forEach(p => pullPlugins(p));
      }
    }

    loadedPresets.forEach(p => pullPlugins(p));

    plugins.unshift(...loadedPlugins);

    plugins = plugins.filter((info, idx, self) => self.findIndex(t => t.name === info.name) === idx);
    // filter out duplicate plugins based on order
    // - priority is added plugins > preset plugins > nested preset plugins

    // lastly, filter explicitly removed plugin
    plugins = plugins.filter((info => !pluginsToRemove.has(pluginIdentifier(info.name).fullName)));

    return {
      presets: loadedPresets,
      plugins
    };
  }
};

