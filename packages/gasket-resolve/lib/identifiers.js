const { makePackageIdentifier } = require('./package-identifier');

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
 *
 * @type {PackageIdentifier}
 */
const pluginIdentifier = makePackageIdentifier('gasket');

/**
 *
 * @type {PackageIdentifier}
 */
const presetIdentifier = makePackageIdentifier('gasket', { type: 'preset' });


module.exports = {
  pluginIdentifier,
  presetIdentifier
};
