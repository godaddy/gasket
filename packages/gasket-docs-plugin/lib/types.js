/**
 * @typedef {Object} DocsSetup
 *
 * @property {string} link - Markdown link relative to package root
 * @property {glob[]} [files]
 * @property {DocsTransform[]} [transforms]
 */

/**
 * @typedef {Object} DocsConfig
 *
 * @property {string} name
 * @property {string} [description]
 * @property {string} [link]
 * @property {string} sourceRoot
 * @property {string} targetRoot
 */

/**
 * @typedef {DocsConfig} ModuleDocsConfig
 *
 * @property {String[]} files
 * @property {DocsTransform[]} transforms
 * @property {Metadata} metadata
 */

/**
 * @typedef {DocsConfig} SubDocsConfig
 *
 * @property {string} from
 */

/**
 * @typedef {SubDocsConfig} LifecycleDocsConfig
 *
 * @property {string} method
 * @property {string} [parent]
 * @property {string} [command]
 */

/**
 * @typedef {Object} DocsConfigSet
 *
 * @property {ModuleDocsConfig} app
 * @property {ModuleDocsConfig[]} plugins
 * @property {ModuleDocsConfig[]} presets
 * @property {ModuleDocsConfig[]} modules
 * @property {SubDocsConfig[]} structures
 * @property {SubDocsConfig[]} commands
 * @property {LifecycleDocsConfig[]} lifecycles
 * @property {DocsTransform[]} transforms - Global docs transforms
 * @property {string} root
 * @property {string} docsRoot
 */

/**
 * @typedef {Function} DocsTransformHandler
 *
 * @param {String} content - Content
 * @param {Object} data
 * @param {String} data.filename - Relative package filename
 * @param {String} data.source - Absolute source filename
 * @param {ModuleDocsConfig} data.docsConfig -
 * @param {DocsConfigSet} data.docsConfigSet -
 */

/**
 * @typedef {Object} DocsTransform
 *
 * @property {Boolean} [global] - If true, will be applied to all doc files
 * @property {RegExp} test - Expression to test against the full source file path
 * @property {DocsTransformHandler} handler - Expression to test against the full source file path
 */
