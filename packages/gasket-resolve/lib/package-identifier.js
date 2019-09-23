/**
 * Utility class for working with package names and versions
 *
 * @type {PackageIdentifier}
 */
class PackageIdentifier {
  /**
   * Create a new package identifier instance
   *
   * @param {String} rawName - Original input name of a package
   * @param {String} suffix - suffix for special package names (-preset, or -plugin)
   */
  constructor(rawName, suffix) {
    this.rawName = rawName;
    this.suffix = suffix;

    this.reShortName = new RegExp(`@gasket\\/([\\w-]+)${suffix}`);
    this.reName = /^(@?[\w/-]+)@?(.*)/;
    this.reSuffix = new RegExp(`${suffix}$`);

    //
    // Validate package description
    //
    const [, nameOnly] = this.reName.exec(this.rawName);
    if (nameOnly.startsWith('@gasket') && !nameOnly.endsWith(suffix)) {
      throw new Error(`Package descriptions with @gasket scope require suffix '${suffix}' for ${rawName}`);
    }
  }

  /**
   * Get the full package name
   *
   * Examples:
   * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin
   * - https -> @gasket/https-plugin
   *
   * @returns {string} fullName
   */
  get fullName() {
    const [, name] = this.reName.exec(this.rawName);

    return this.reSuffix.test(name) ? name : `@gasket/${name}${this.suffix}`;
  }

  /**
   * Get the short package name
   *
   * Examples:
   * - @gasket/https-plugin -> https
   * - https@1.2.3 -> https
   *
   * @returns {string} fullName
   */
  get shortName() {
    const [, name] = this.reName.exec(this.rawName);
    const match = this.reShortName.exec(name);

    return match ? match[1] : name;
  }

  /**
   * Get only the package name
   *
   * Examples:
   * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin
   * - https@1.2.3 -> https
   *
   * @returns {string} fullName
   */
  get name() {
    const [, name] = this.reName.exec(this.rawName);

    return name;
  }

  /**
   * Get only the package version
   *
   * Examples:
   * - @gasket/https-plugin@1.2.3 -> 1.2.3
   * - @gasket/https-plugin -> ''
   *
   * @returns {string} fullName
   */
  get version() {
    const [, , version] = this.reName.exec(this.rawName);

    return version || null;
  }

  /**
   * Get the full package name with version
   *
   * Examples:
   * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
   * - https@1.2.3 -> @gasket/https-plugin@1.2.3
   *
   * @returns {string} fullName
   */
  get full() {
    const name = this.fullName;
    const version = this.version;
    return name + (version ? `@${version}` : '');
  }

  /**
   * Returns new PackageIdentifier with version added to desc if missing
   *
   * Examples:
   * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
   * - @gasket/https-plugin -> @gasket/https-plugin@latest
   *
   * @param {string} [defaultVersion] - the version name to add if missing
   * @returns {PackageIdentifier} identifier
   */
  withVersion(defaultVersion = 'latest') {
    const [, name, version] = this.reName.exec(this.rawName);

    const nextName = name + '@' + (version || defaultVersion);
    return new PackageIdentifier(nextName, this.suffix);
  }
}

/**
 * Output the original raw name for string concatenation.
 *
 * @returns {String} string
 */
PackageIdentifier.prototype.toString = function () {
  return this.rawName;
};

/**
 * The package name with or without version of a plugin.
 *
 * For example:
 *   - @gasket/jest-plugin        - fullName
 *   - jest                       - shortName
 *   - @gasket/jest-plugin@^1.2.3 - full with version
 *   - jest@^1.2.3                - short with version
 *
 * Not intended for use with non-plugin package descriptions.
 * For example, the following patterns will not work:
 *   - @gasket/jest
 *
 * @typedef {String} PluginDesc
 */

/**
 * The package name with or without version of a preset.
 *
 * For example:
 *   - @gasket/nextjs-preset        - fullName
 *   - nextjs                       - shortName
 *   - @gasket/nextjs-preset@^1.2.3 - full with version
 *   - nextjs@^1.2.3                - short with version
 *
 * @typedef {String} PresetDesc
 */

/**
 * The package name only of a plugin.
 *
 * For example:
 *   - @gasket/jest-plugin        - fullName
 *   - jest                       - shortName
 *
 * @typedef {String} PluginName
 */

/**
 * The package name only of a preset.
 *
 * For example:
 *   - @gasket/nextjs-preset        - fullName
 *   - nextjs                       - shortName
 *
 * @typedef {String} PresetName
 */

/**
 * Package identifier for work with plugin name
 *
 * @param {PluginDesc} name - Name of the plugin package
 * @returns {PackageIdentifier} identifier
 */
function pluginIdentifier(name) {
  return new PackageIdentifier(name, '-plugin');
}

/**
 * Util method to check if a full name is valid
 *
 * Examples:
 * - @gasket/https-plugin -> true
 * - @gasket/https-plugin@1.2.3 -> false
 * - https -> false
 *
 * @param {string} maybeFullName - Name to check
 * @returns {boolean} fullName
 */
pluginIdentifier.isValidFullName = function isValidFullName(maybeFullName) {
  try {
    return pluginIdentifier(maybeFullName).fullName === maybeFullName;
  } catch (e) {
    return false;
  }
};

/**
 * Package identifier for work with preset name
 *
 * @param {PresetDesc} name - Name of the preset package
 * @returns {PackageIdentifier} identifier
 */
function presetIdentifier(name) {
  return new PackageIdentifier(name, '-preset');
}

/**
 * Util method to check if a full name is valid
 *
 * Examples:
 * - @gasket/nextjs-preset -> true
 * - @gasket/nextjs-preset@1.2.3 -> false
 * - nextjs -> false
 *
 * @param {string} maybeFullName - Name to check
 * @returns {boolean} fullName
 */
presetIdentifier.isValidFullName = function isValidFullName(maybeFullName) {
  try {
    return presetIdentifier(maybeFullName).fullName === maybeFullName;
  } catch (e) {
    return false;
  }
};



module.exports = {
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
};
