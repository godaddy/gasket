const path = require('path');
const flatten  = require('./flatten');
const Resolver  = require('./resolver');
const { pluginIdentifier, presetIdentifier } = require('./package-identifier');

/**
 * Check if module appears to be a path name.
 *
 * @type {RegExp}
 */
const isModulePath = /^[/.]|node_modules/;

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
   * @param {String} moduleName - Name of module to load
   * @param {Object} [meta] - Additional meta data
   * @param {Boolean} [options] - Loading options
   * @param {Boolean} [options.shallow] - Do not recursively load dependencies
   * @returns {PresetInfo} module
   */
  loadPreset(moduleName, meta, { shallow = false } = {}) {
    const fullName = presetIdentifier(moduleName).fullName;
    const presetInfo = this.loadModule(fullName, meta);

    const { dependencies } = presetInfo.package;
    const { resolve: presetResolve } = presetInfo.module;

    // If this preset provided a resolve function, use it for its plugins
    const presetResolver = presetResolve ? new Loader({ resolve: presetResolve }) : this;

    // filter out a list of presets and plugins from dependencies
    const presetNames = Object.keys(dependencies).filter(k => presetIdentifier.isValidFullName(k));
    const pluginNames = Object.keys(dependencies).filter(k => pluginIdentifier.isValidFullName(k));

    let presets;
    let plugins;
    const from = fullName;
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
   * Loads presets and plugins as configured
   *
   * @param {Object} pluginConfig - Presets and plugins to load
   * @returns {{presets: PresetInfo[], plugins: PluginInfo[]}} results
   */
  loadConfigured(pluginConfig) {
    const { presets = [], add = [], remove = [] } = pluginConfig || {};
    const pluginsToRemove = new Set(remove.map(name => pluginIdentifier(name).fullName) || []);

    const from = 'gasket.config';

    const loadedPresets = flatten(presets).map(name => this.loadPreset(name, { from }));
    const loadedPlugins = add.map(module => this.loadPlugin(module, { from }));


    // flatten plugins from presets
    let resolvedPlugins = [];

    function pullPlugins(preset) {
      resolvedPlugins.push(...preset.plugins);
      if (Array.isArray(preset.presets)) {
        preset.presets.forEach(p => pullPlugins(p));
      }
    }

    loadedPresets.forEach(p => pullPlugins(p));

    resolvedPlugins.unshift(...loadedPlugins);

    // filter out duplicate plugins based on order
    // - priority is added plugins > preset plugins > nested preset plugins
    resolvedPlugins = resolvedPlugins.filter((info, idx, self) => self.findIndex(t => t.name === info.name) === idx);

    // lastly, filter explicitly plugin
    resolvedPlugins = resolvedPlugins.filter((info => !pluginsToRemove.has(pluginIdentifier(info.name).fullName)));

    return {
      presets: loadedPresets,
      plugins: resolvedPlugins
    };
  }
};

