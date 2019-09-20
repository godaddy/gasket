const path = require('path');
const { promisify } = require('util');

const glob = promisify(require('glob'));

const isAppPlugin = /^\/.+\/plugins\//;
const isUrl = /^(https?:)?\/\//;

/**
 * Expected SubDocsConfig types
 *
 * @type {string[]}
 */
const subDocTypes = [
  'commands',
  'structures',
  'lifecycles'
];

const docsSetupDefault = { link: 'README.md', includes: ['docs/**/*'] };

/**
 * Util class for constructing the DocsConfigSet
 *
 * type {Class}
 */
class DocsConfigSetBuilder {
  /**
   * @param {Gasket} gasket - Gasket API
   */
  constructor(gasket) {
    this._plugins = [];
    this._presets = [];
    this._modules = [];
    this._transforms = [];

    const { root = process.cwd(), docs: { outputDir } } = gasket.config;
    this._root = root;
    this._docsRoot = path.join(root, outputDir);
  }

  /**
   * Look up all doc files for a module
   *
   * @param {ModuleInfo} moduleInfo - Metadata for a module
   * @param {DocsSetup} docsSetup - Docs setup
   * @param {string} link - main file
   * @param {string} sourceRoot - Absolute path to the module's package
   * @returns {Promise<string[]>} files
   * @private
   */
  async _findAllFiles(moduleInfo, docsSetup, link, sourceRoot) {

    const noHash = filename => filename.split('#')[0];
    const fileSet = new Set([]);

    const tryAdd = maybeFile => {
      if (Boolean(maybeFile) && !isUrl.test(maybeFile)) {
        fileSet.add(noHash(maybeFile));
      }
    };

    // Add file for main doc link if not a url
    tryAdd(link);

    // Add files for sub meta types docs
    subDocTypes.forEach(metaType => {
      if (metaType in moduleInfo) {
        moduleInfo[metaType].forEach(o => {
          tryAdd(o.link);
        });
      }
    });

    let { files = [] } = docsSetup;
    files = Array.isArray(files) ? files : [files];

    (await Promise.all(files.map(async g => await glob(g, { cwd: sourceRoot }))))
      .reduce((acc, cur) => acc.concat(cur), [])
      .forEach(file => tryAdd(file));

    return Array.from(fileSet);
  }

  /**
   * Divides global and local transforms from a docsSetup.
   * Global transforms are added to the top-level set.
   * Local transforms will be added to the module's docConfig.
   *
   * @param {DocsTransform[]} transforms - Transforms to segregate
   * @returns {DocsTransform[]} remaining local transforms
   * @private
   */
  _segregateTransforms(transforms) {
    return transforms.reduce((acc, tx) => {
      if (tx.global) {
        this._transforms.push(tx);
      } else {
        acc.push(tx);
      }
      return acc;
    }, []);
  }

  /**
   * Constructs the DocsConfig for a moduled based on it's info and docsSetup
   *
   * @param {ModuleInfo} moduleInfo - Metadata for a module
   * @param {DocsSetup} docsSetup - Includes and doc defaults
   * @param {Object} overrides - Pre-configured properties
   * @returns {DocsConfig} docsConfigs
   * @private
   */
  async _buildDocsConfig(moduleInfo, docsSetup = {}, overrides = {}) {
    const {
      name,
      version,
      // fallback to docsSetup or package.json content
      link = docsSetup.link || moduleInfo.package && moduleInfo.package.homepage,
      description = docsSetup.description || moduleInfo.package && moduleInfo.package.description
    } = moduleInfo;

    const { sourceRoot = moduleInfo.path } = overrides;

    // Get only the local transforms
    const transforms = this._segregateTransforms(docsSetup.transforms || []);

    const files = await this._findAllFiles(moduleInfo, docsSetup, link, sourceRoot);

    return {
      ...docsSetup,
      name,
      version,
      description,
      link,
      sourceRoot,
      ...overrides,
      transforms,
      files,
      metadata: moduleInfo
    };
  }

  /**
   * Flattens all sub types from plugins' metadata.
   * Add a from property with name of parent plugin.
   *
   * @param {string} type - Sub type in metadata
   * @returns {SubDocsConfig[]} flattened
   * @private
   */
  _flattenSubType(type) {
    const arr = [];
    this._plugins.forEach(pluginDoc => {
      const { sourceRoot, targetRoot, name: from } = pluginDoc;
      arr.push(
        ...(pluginDoc.metadata[type] || []).map(docsSetup => ({
          ...docsSetup,
          from,
          sourceRoot,
          targetRoot
        }))
      );
    });
    return arr;
  }

  /**
   * Add DocsConfig to the set for the App
   *
   * @param {ModuleInfo} moduleInfo - Metadata for app module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addApp(moduleInfo, docsSetup = docsSetupDefault) {
    if (!this._app) {
      const targetRoot = path.join(this._docsRoot, 'app');
      this._app = await this._buildDocsConfig(moduleInfo, docsSetup, { targetRoot });
    }
  }

  /**
   * Add DocsConfig to the set for a plugin
   *
   * @param {PluginInfo} pluginInfo - Metadata for plugin
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addPlugin(pluginInfo, docsSetup = docsSetupDefault) {
    if (this._plugins.find(p => p.metadata === pluginInfo)) return;

    let { name, path: sourceRoot } = pluginInfo;
    let targetRoot = path.join(this._docsRoot, 'plugins', ...name.split('/'));
    if (isAppPlugin.test(pluginInfo.name)) {
      name = path.relative(this._root, name);
      sourceRoot = path.join(this._root);
      targetRoot = path.join(this._docsRoot, 'app');
    }
    const docConfig = await this._buildDocsConfig(pluginInfo, docsSetup, { targetRoot, name, sourceRoot });
    this._plugins.push(docConfig);

    // TODO (agerard): handle modules from metadata and/or docsSetup
  }

  /**
   * Add DocsConfig to the set for multiple plugins if not already added
   *
   * @param {PluginInfo[]} pluginInfos - Metadata for multiple plugins
   * @async
   */
  async addPlugins(pluginInfos) {
    await Promise.all(pluginInfos.map(p => this.addPlugin(p)));
  }

  /**
   * Add DocsConfig to the set for a preset
   *
   * @param {PresetInfo} presetInfo - Metadata for preset
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addPreset(presetInfo, docsSetup = docsSetupDefault) {
    if (this._presets.find(p => p.metadata === presetInfo)) return;

    const { name } = presetInfo;
    const targetRoot = path.join(this._docsRoot, 'presets', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(presetInfo, docsSetup, { targetRoot });
    this._presets.push(docConfig);
  }

  /**
   * Add DocsConfig to the set for multiple presets if not already added
   *
   * @param {PresetInfo[]} presetInfos - Metadata for multiple presets
   * @async
   */
  async addPresets(presetInfos) {
    await Promise.all(presetInfos.map(p => this.addPreset(p)));
  }

  /**
   * Add DocsConfig to the set for a module
   *
   * @param {ModuleInfo} moduleInfo - Metadata for a module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addModule(moduleInfo, docsSetup = {}) {
    if (this._modules.find(p => p.metadata === moduleInfo)) return;

    const { name } = moduleInfo;
    const targetRoot = path.join(this._docsRoot, 'modules', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(moduleInfo, docsSetup, { targetRoot });
    this._modules.push(docConfig);
  }

  /**
   * Add DocsConfig to the set for multiple modules if not already added
   *
   * @param {ModuleInfo[]} moduleInfos - Metadata for multiple modules
   * @async
   */
  async addModules(moduleInfos) {
    await Promise.all(moduleInfos.map(p => this.addModule(p)));
  }

  /**
   * Picks out properties to return as the config set
   *
   * @returns {DocsConfigSet} docsConfigSet - Configuration for docs generation
   */
  getConfigSet() {
    const subDocsConfigs = subDocTypes
      .reduce((acc, metaType) => ({ ...acc, [metaType]: this._flattenSubType(metaType) }), {});

    return {
      app: this._app,
      plugins: this._plugins,
      presets: this._presets,
      modules: this._modules,
      root: this._root,
      docsRoot: this._docsRoot,
      transforms: this._transforms,
      ...subDocsConfigs
    };
  }
}

DocsConfigSetBuilder.docsSetupDefault = docsSetupDefault;

module.exports = DocsConfigSetBuilder;
