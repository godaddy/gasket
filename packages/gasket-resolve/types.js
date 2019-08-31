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
