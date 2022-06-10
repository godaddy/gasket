/**
 * Setup object to describe docs configuration for a module
 *
 * @typedef {object} DocsSetup
 *
 * @property {string} link - Markdown link relative to package root
 * @property {glob[]} [files] - Names and/or patterns of files to collect
 * @property {DocsTransform[]} [transforms] - Transforms to apply to collected files
 * @property {Object.<string, DocsSetup>} [modules] - Setup object for supporting modules
 */

/**
 * Base docs configuration
 *
 * @typedef {object} DocsConfig
 *
 * @property {string} name - Name of the module or element
 * @property {string} [description] - Description of the module or element
 * @property {string} [link] - Relative path to a doc from the module's package
 * @property {string} sourceRoot - Absolute path to the module's package
 * @property {string} targetRoot - Absolute path to output dir for the module
 */

/**
 * Docs configuration for a module
 *
 * @typedef {DocsConfig} ModuleDocsConfig
 *
 * @property {string[]} files - Resolved files from docsSetup
 * @property {DocsTransform[]} transforms - Local doc transforms
 * @property {ModuleData} metadata - Originating metadata for this module
 */

/**
 * Docs configuration for members of a plugin
 *
 * @typedef {DocsConfig} DetailDocsConfig
 *
 * @property {string} from - Name from the parent ModuleDocsConfig
 */

/**
 * Docs configuration with specifics for plugin lifecycles
 *
 * @typedef {DetailDocsConfig} LifecycleDocsConfig
 *
 * @property {string} method - Executing method from the engine
 * @property {string} [parent] - Lifecycle from which this one is invoked
 * @property {string} [command] - Command from which this lifecycle is invoked
 */

/**
 * Set of docs configurations for the app
 *
 * @typedef {object} DocsConfigSet
 *
 * @property {ModuleDocsConfig} app - Docs from the main package
 * @property {ModuleDocsConfig[]} plugins - Docs for all configured plugins
 * @property {ModuleDocsConfig[]} presets - Docs for all configured presets
 * @property {ModuleDocsConfig[]} modules - Docs of supporting modules
 * @property {DetailDocsConfig[]} structures - Docs describing structure elements
 * @property {DetailDocsConfig[]} commands - Docs for available commands
 * @property {DetailDocsConfig[]} guides - Docs for setups and explanations
 * @property {LifecycleDocsConfig[]} lifecycles - Docs for available lifecycles
 * @property {DocsTransform[]} transforms - Global doc transforms
 * @property {string} root - Absolute path to main package
 * @property {string} docsRoot - Absolute path to output directory
 */

/**
 * Transform content of doc files matching test pattern
 *
 * @typedef {object} DocsTransform
 *
 * @property {boolean} [global] - If true, will be applied to all files, otherwise to only files in module.
 * @property {RegExp} test - Expression to test against the full source filename
 * @property {DocsTransformHandler} handler - Function to modify matching files' contents
 */

/**
 * Handler to modify file contents for a DocsTransform
 *
 * @typedef {function} DocsTransformHandler
 *
 * @param {string} content - Doc file content to transform
 * @param {object} data - Additional details relating to the doc file being handled
 * @param {string} data.filename - Relative path of this filename
 * @param {ModuleDocsConfig} data.docsConfig - Docs config for this file's module
 * @param {DocsConfigSet} data.docsConfigSet - Set of configs for the app
 * @returns {string} transformed content
 */
