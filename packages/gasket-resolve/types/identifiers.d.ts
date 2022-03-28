import { createPackageIdentifier } from './package-identifier';

/**
 * The package name with or without version of a plugin.
 *
 * For example:
 *   - @gasket/plugin-https        - fullName
 *   - @gasket/https               - shortName
 *   - @gasket/plugin-https@^1.2.3 - full with version
 *   - @gasket/https@^1.2.3        - short with version
 *   - gasket-plugin-https         - user fullName
 *   - https                       - user shortName
 *
 * Not intended for use with non-plugin package descriptions.
 * For example, the following patterns will not work:
 *   - @gasket/https
 */
export type PluginDesc = string;
/**
 * The package name with or without version of a preset.
 *
 * For example:
 *   - @gasket/preset-nextjs        - fullName
 *   - @gasket/nextjs               - shortName
 *   - @gasket/preset-nextjs@^1.2.3 - full with version
 *   - @gasket/nextjs@^1.2.3        - short with version
 *   - gasket-preset-nextjs         - user fullName
 *   - nextjs                       - user shortName
 */
export type PresetDesc = string;
/**
 * The package name only of a plugin.
 *
 * For example:
 *   - @gasket/plugin-https        - fullName
 *   - @gasket/https               - shortName
 *   - gasket-plugin-https         - user fullName
 *   - https                       - user shortName
 */
export type PluginName = string;
/**
 * The package name only of a preset.
 *
 * For example:
 *   - @gasket/preset-nextjs        - fullName
 *   - @gasket/nextjs               - shortName
 *   - gasket-preset-nextjs         - user fullName
 *   - nextjs                       - user shortName
 */
export type PresetName = string;
/**
 * The package name with or without version of a plugin.
 *
 * For example:
 *   - @gasket/plugin-https        - fullName
 *   - @gasket/https               - shortName
 *   - @gasket/plugin-https@^1.2.3 - full with version
 *   - @gasket/https@^1.2.3        - short with version
 *   - gasket-plugin-https         - user fullName
 *   - https                       - user shortName
 *
 * Not intended for use with non-plugin package descriptions.
 * For example, the following patterns will not work:
 *   - @gasket/https
 *
 * @typedef {string} PluginDesc
 */
/**
 * The package name with or without version of a preset.
 *
 * For example:
 *   - @gasket/preset-nextjs        - fullName
 *   - @gasket/nextjs               - shortName
 *   - @gasket/preset-nextjs@^1.2.3 - full with version
 *   - @gasket/nextjs@^1.2.3        - short with version
 *   - gasket-preset-nextjs         - user fullName
 *   - nextjs                       - user shortName
 *
 * @typedef {string} PresetDesc
 */
/**
 * The package name only of a plugin.
 *
 * For example:
 *   - @gasket/plugin-https        - fullName
 *   - @gasket/https               - shortName
 *   - gasket-plugin-https         - user fullName
 *   - https                       - user shortName
 *
 * @typedef {string} PluginName
 */
/**
 * The package name only of a preset.
 *
 * For example:
 *   - @gasket/preset-nextjs        - fullName
 *   - @gasket/nextjs               - shortName
 *   - gasket-preset-nextjs         - user fullName
 *   - nextjs                       - user shortName
 *
 * @typedef {string} PresetName
 */
/**
 * Create package identifiers for Gasket plugins
 *
 * @type {createPackageIdentifier}
 * @function
 */
export const pluginIdentifier: typeof createPackageIdentifier;
/**
 * Create package identifiers for Gasket presets
 *
 * @type {createPackageIdentifier}
 * @function
 */
export const presetIdentifier: typeof createPackageIdentifier;
