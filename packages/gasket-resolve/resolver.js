const path = require('path');
const debug = require('diagnostics')('gasket:resolver');
const pluginInfo = require('./plugin-info');
const { pluginIdentifier, presetIdentifier } = require('./package-identifier');

module.exports = class Resolver {
  constructor({ resolveFrom, resolve, root = process.cwd() } = {}) {
    if (resolveFrom) this.resolveFrom = resolveFrom;
    this.resolve = resolve || require;
    this.root = root;
  }

  pluginFor(name) {
    if (typeof name !== 'string') return name;

    return this.resolveShorthandModule(
      name,
      shortName => pluginIdentifier(shortName).fullName,
      fullName => `Plugin ${fullName} could not be resolved. Make sure it is installed.`);
  }

  pluginInfoFor({ shortName, range, preset, required, config }) {
    return pluginInfo({
      required: required || this.pluginFor(shortName),
      preset,
      shortName,
      range,
      config
    });
  }

  presetFor(name) {
    if (typeof name !== 'string') return name;

    return this.resolveShorthandModule(
      name,
      shortName => presetIdentifier(shortName).fullName,
      fullName => `Preset ${fullName} could not be resolved. Make sure it is installed.`);
  }

  resolveShorthandModule(
    name,
    nameGenerator,
    errorMessageGenerator
  ) {
    const fullName = nameGenerator(name);
    const module = this.tryRequire(fullName) || this.tryRequire(name);
    if (!module) {
      throw new Error(errorMessageGenerator(fullName));
    }
    return module;
  }

  tryRequire(moduleName) {
    const modulePath = this.resolveFrom
      ? path.join(this.resolveFrom, moduleName)
      : moduleName;

    try {
      debug('try-require require', modulePath);
      return this.resolve(modulePath);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND'
        && err.message.includes(modulePath)) return null;

      debug('try-require', err.message);
      throw err;
    }
  }

  /**
   * Returns the resolved filename of the module
   *
   * @param {String} moduleName name of the module
   * @returns {String} filename of the module
   * @public
   */
  tryResolve(moduleName) {
    const options = this.resolveFrom ? { paths: [this.resolveFrom] } : {};
    return require.resolve(moduleName, options);
  }

  /**
   * Returns the relative path of the preset
   *
   * @param {String} presetName name of the preset
   * @returns {Path} relative path of the preset
   * @public
   */
  tryResolvePresetRelativePath(presetName) {
    const presetFullName = presetIdentifier(presetName).fullName;

    // If resolveFrom was used, then we need to remove the last path path from it that includes `node_modules`
    const rootPath = this.resolveFrom ? this.resolveFrom.substring(0, this.resolveFrom.lastIndexOf('/')) : this.root;
    return path.relative(rootPath, path.dirname(this.tryResolve(`${presetFullName}/package.json`)));
  }

  /**
   * Returns the relative path of the plugin
   *
   * @param {String} pluginName name of the plugin
   * @returns {Path} relative path of the plugin
   * @public
   */
  tryResolvePluginRelativePath(pluginName) {
    // If the plugin is defined locally
    if (pluginName.indexOf(this.root) !== -1) {
      return path.relative(this.root, pluginName);
    }

    const pluginFullName = pluginIdentifier(pluginName).fullName;
    // If resolveFrom was used, then we need to remove the last path path from it that includes `node_modules`
    const rootPath = this.resolveFrom ? this.resolveFrom.substring(0, this.resolveFrom.lastIndexOf('/')) : this.root;
    return path.relative(rootPath, path.dirname(this.tryResolve(`${pluginFullName}/package.json`)));
  }
};

