/**
 * Module with meta data
 *
 * @typedef {object} ModuleData
 *
 * @property {string} name - Name of preset
 * @property {string} module - Actual module content
 * @property {string} [package] - Package.json contents
 * @property {string} [version] - Resolved version
 * @property {string} [path] - Path to the root of package
 * @property {string} [from] - Name of module which requires this module
 * @property {string} [range] - Range by which this module was required
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
 * @property {PresetData[]} [presets] - Presets that this preset extends
 * @property {PluginData[]} plugins - Plugins this preset uses
 */

/**
 * Metadata for details of a plugin
 *
 * @typedef {object} DetailData
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
 * @property {string} method - Executing method from the engine
 * @property {string} [parent] - Lifecycle from which this one is invoked
 * @property {string} [command] - Command from which this lifecycle is invoked
 */

/**
 * Metadata for plugin configuration properties
 *
 * @typedef {DetailData} ConfigurationsData
 *
 * @property {string} type - Configuration property type
 */

/**
 * Collection data for modules configured for app
 *
 * @typedef {object} Metadata
 * @property {AppData} app - App and main package data
 * @property {PresetData[]} presets - Preset data with dependency hierarchy
 * @property {PluginData[]} plugins - Flat list of registered plugin data
 * @property {ModuleData[]} modules - Supporting module data
 */
