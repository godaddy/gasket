/**
 * Module with meta data
 *
 * @typedef {Object} ModuleData
 *
 * @property {String} name - Name of preset
 * @property {String} module - Actual module content
 * @property {String} [package] - Package.json contents
 * @property {String} [version] - Resolved version
 * @property {String} [path] - Path to the root of package
 * @property {String} [from] - Name of module which requires this module
 * @property {String} [range] - Range by which this module was required
 * @property {string} [link] - Path to a doc file or URL
 */

/**
 * App module with meta data
 *
 * @typedef {ModuleData} AppData
 * @property {DetailData[]} [modules] - Description of modules supporting this plugin
 */

/**
 * Plugin module with meta data
 *
 * @typedef {ModuleData} PluginData
 * @property {DetailData[]} [commands] - Commands enabled by this plugin
 * @property {DetailData[]} [structures] - App files and directories used by plugin
 * @property {DetailData[]} [lifecycles] - Description of lifecycles invoked by plugin
 * @property {DetailData[]} [modules] - Description of modules supporting this plugin
 */

/**
 * Preset module with meta data
 *
 * @typedef {ModuleData} PresetData
 * @property {PresetData[]} presets - Presets that this preset extends
 * @property {PluginData[]} plugins - Plugins this preset uses
 */

/**
 * Metadata for details of a plugin
 *
 * @typedef {Object} DetailData
 *
 * @property {string} name - Name of the the module or element
 * @property {string} [description] - Description of the module or element
 * @property {string} [link] - Path to a doc file or URL
 */

/**
 * Metadata with specifics details for plugin lifecycles
 *
 * @typedef {DetailData} LifecycleData
 *
 * @property {string} method - Executing method from the plugin-engine
 * @property {string} [parent] - Lifecycle from which this one is invoked
 * @property {string} [command] - Command from which this lifecycle is invoked
 */

/**
 * Collection data for modules configured for app
 *
 * @typedef {Object} Metadata
 * @property {AppData[]} app - App and main package data
 * @property {PresetData[]} presets - Preset data with dependency hierarchy
 * @property {PluginData[]} plugins - Flat list of registered plugin data
 * @property {ModuleData[]} modules - Supporting module data
 */
