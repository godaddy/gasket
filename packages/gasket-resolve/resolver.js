const path = require('path');
const debug = require('diagnostics')('gasket:resolver');
const pluginInfo = require('./plugin-info');
const { pluginIdentifier, presetIdentifier } = require('./package-identifier');

module.exports = class Resolver {
  constructor({ resolveFrom, resolve } = {}) {
    if (resolveFrom) this.resolveFrom = resolveFrom;
    this.resolve = resolve || require;
  }

  pluginFor(name) {
    if (typeof name !== 'string') return name;

    return this.resolveShorthandModule(
      name,
      this.pluginFullName,
      fullName => `Plugin ${fullName} could not be resolved. Make sure it is installed.`);
  }

  pluginFullName(name) {
    return pluginIdentifier(name).fullName;
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
      this.presetFullName,
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

  presetFullName(name) {
    return presetIdentifier(name).fullName;
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
};
