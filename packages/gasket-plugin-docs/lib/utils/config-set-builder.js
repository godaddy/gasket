
const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');
const { promisify } = require('util');
const { sortModules, sortStructures, sortCommands, sortLifecycles, sortGuides, sortConfigurations } = require('./sorts');

// TODO: Need to review for native promise usage
const glob = promisify(require('glob'));

const isAppPlugin = /^\/.+\/plugins\//;
const isUrl = /^(https?:)?\/\//;
const isGasketScope = /^@gasket/;

const detailDocsHelpers = {
  guides: {
    sort: sortGuides
  },
  commands: {
    sort: sortCommands
  },
  structures: {
    sort: sortStructures
  },
  lifecycles: {
    sort: sortLifecycles
  },
  configurations: {
    sort: sortConfigurations
  }
};

/**
 * Expected DetailDocsConfig types
 *
 * @type {string[]}
 */
const detailDocsTypes = Object.keys(detailDocsHelpers);

/**
 * Defaults for when a docsSetup is not declared.
 *
 * @type {{link: string, files: array}}
 */
const docsSetupDefault = Object.freeze({ link: 'README.md', files: ['docs/**/*.*', 'LICENSE.md'] });

/**
 * Returns a filename with the hash removed
 *
 * @param {string} link - Filename that may have hash
 * @returns {string} filename
 */
const noHash = link => link && link.split('#')[0];

const getDocsSetupFromPkg = moduleData => moduleData.package && moduleData.package.gasket && moduleData.package.gasket.docsSetup;

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

    const { root, docs: { outputDir } } = gasket.config;
    this._root = root;
    this._docsRoot = path.join(root, outputDir);

    this._moduleDocsSetups = {};
  }

  /**
   * Look up all doc files for a module
   *
   * @param {ModuleData} moduleData - Metadata for a module
   * @param {DocsSetup} docsSetup - Docs setup
   * @param {string} link - main file
   * @param {string} sourceRoot - Absolute path to the module's package
   * @returns {Promise<string[]>} files
   * @private
   */
  async _findAllFiles(moduleData, docsSetup, link, sourceRoot) {
    if (!sourceRoot) return [];

    const fileSet = new Set([]);

    const tryAdd = maybeFile => {
      if (Boolean(maybeFile) && !isUrl.test(maybeFile)) {
        fileSet.add(noHash(maybeFile));
      }
    };

    // Add file for main doc link if not a url
    tryAdd(link);

    // Add files for detail meta types docs
    detailDocsTypes.forEach(metaType => {
      if (metaType in moduleData) {
        moduleData[metaType].forEach(o => {
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
   * Constructs the DocsConfig for a module based on its info and docsSetup
   *
   * @param {ModuleData} moduleData - Metadata for a module
   * @param {DocsSetup} docsSetup - Files to include and transforms
   * @param {object} overrides - Pre-configured properties
   * @returns {DocsConfig} docsConfigs
   * @private
   */
  async _buildDocsConfig(moduleData, docsSetup = {}, overrides = {}) {
    const {
      name,
      version,
      // fallback to docsSetup or package.json content
      link = docsSetup.link || moduleData.package && moduleData.package.homepage,
      description = docsSetup.description || moduleData.package && moduleData.package.description
    } = moduleData;

    const { sourceRoot = moduleData.path } = overrides;

    // Get only the local transforms
    const transforms = this._segregateTransforms(docsSetup.transforms || []);

    const files = await this._findAllFiles(moduleData, docsSetup, link, sourceRoot);

    return {
      ...docsSetup,
      name,
      version,
      description,
      // safety-check: if link wants to be a file but was not found
      link: !files.includes(noHash(link)) && !isUrl.test(link) ? null : link,
      sourceRoot,
      ...overrides,
      transforms,
      files,
      metadata: moduleData
    };
  }

  /**
   * Flattens all detail types from plugins' metadata.
   * Add a from property with name of parent plugin.
   *
   * @param {string} type - Detail type in metadata
   * @returns {DetailDocsConfig[]} flattened
   * @private
   */
  _flattenDetails(type) {
    const arr = [];
    this._modules.concat(this._presets).concat(this._plugins).forEach(moduleDoc => {
      const { sourceRoot, targetRoot, name: from } = moduleDoc;
      arr.push(
        ...(moduleDoc.metadata[type] || []).map(docsSetup => ({
          ...docsSetup,
          from,
          sourceRoot,
          targetRoot
        }))
      );
    });

    return detailDocsHelpers[type].sort(arr);
  }

  /**
   * Adds additional docsSetup for modules, merging duplicates with a first
   * in wins approach. When a module is then add to be configured, a docSetup
   * will be looked up from what's been added by plugins here.
   *
   * @param {Object.<string, DocsSetup>} moduleDocsSetup - Setups for modules
   * @private
   */
  _addModuleDocsSetup(moduleDocsSetup) {
    defaultsDeep(this._moduleDocsSetups, moduleDocsSetup);
  }

  /**
   * Add DocsConfig to the set for the App
   *
   * @param {ModuleData} moduleData - Metadata for app module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addApp(moduleData, docsSetup) {
    // If docsSetup is passed, stick with it.
    // Or, see if gasket.docsSetup in package.json.
    // Finally, fall back to defaults.
    docsSetup = docsSetup || getDocsSetupFromPkg(moduleData) || docsSetupDefault;

    if (!this._app) {
      const targetRoot = path.join(this._docsRoot, 'app');
      this._app = await this._buildDocsConfig(moduleData, docsSetup, { targetRoot });
    }
  }

  /**
   * Add DocsConfig to the set for a plugin
   *
   * @param {PluginData} pluginData - Metadata for plugin
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addPlugin(pluginData, docsSetup) {
    if (this._plugins.find(p => p.metadata === pluginData)) return;

    // If docsSetup is passed, stick with it.
    // Or, see if gasket.docsSetup in package.json.
    // Finally, fall back to defaults.
    docsSetup = docsSetup || getDocsSetupFromPkg(pluginData) || docsSetupDefault;

    let { name, path: sourceRoot } = pluginData;
    let targetRoot = path.join(this._docsRoot, 'plugins', ...name.split('/'));
    if (isAppPlugin.test(pluginData.name)) {
      name = path.relative(this._root, name);
      sourceRoot = path.join(this._root);
      targetRoot = path.join(this._docsRoot, 'app');
    }

    const { modules, ...setup } = docsSetup;
    const docConfig = await this._buildDocsConfig(pluginData, setup, { targetRoot, name, sourceRoot });
    this._plugins.push(docConfig);

    if (modules) {
      this._addModuleDocsSetup(modules);
    }
  }

  /**
   * Add DocsConfig to the set for multiple plugins if not already added
   *
   * @param {PluginData[]} pluginDatas - Metadata for multiple plugins
   * @async
   */
  async addPlugins(pluginDatas) {
    await Promise.all(pluginDatas.map(p => this.addPlugin(p)));
  }

  /**
   * Add DocsConfig to the set for a preset
   *
   * @param {PresetData} presetData - Metadata for preset
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addPreset(presetData, docsSetup) {
    if (this._presets.find(p => p.metadata === presetData)) return;

    // If docsSetup is passed, stick with it.
    // Otherwise, look up a docsSetup defined by preset.
    // Or, see if gasket.docsSetup in package.json.
    // Finally, fall back to defaults.
    docsSetup = docsSetup ||
      presetData.module && presetData.module.docsSetup ||
      getDocsSetupFromPkg(presetData) ||
      docsSetupDefault;

    const { name } = presetData;
    const targetRoot = path.join(this._docsRoot, 'presets', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(presetData, docsSetup, { targetRoot });
    this._presets.push(docConfig);
  }

  /**
   * Add DocsConfig to the set for multiple presets if not already added
   *
   * @param {PresetData[]} presetDatas - Metadata for multiple presets
   * @async
   */
  async addPresets(presetDatas) {
    await Promise.all(presetDatas.map(p => this.addPreset(p)));
  }

  /**
   * Add DocsConfig to the set for a module
   *
   * @param {ModuleData} moduleData - Metadata for a module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addModule(moduleData, docsSetup) {
    if (this._modules.find(p => p.metadata === moduleData)) return;

    // If docsSetup is passed, stick with it.
    // Otherwise, look up a docsSetup added by plugins.
    // Or, see if gasket.docsSetup in package.json.
    // Finally, if this is a @gasket module fall back defaults.
    docsSetup = docsSetup ||
      this._moduleDocsSetups[moduleData.name] ||
      getDocsSetupFromPkg(moduleData) ||
      (isGasketScope.test(moduleData.name) ? docsSetupDefault : {});

    const { name } = moduleData;
    const targetRoot = path.join(this._docsRoot, 'modules', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(moduleData, docsSetup, { targetRoot });
    this._modules.push(docConfig);
  }

  /**
   * Add DocsConfig to the set for multiple modules if not already added
   *
   * @param {ModuleData[]} moduleDatas - Metadata for multiple modules
   * @async
   */
  async addModules(moduleDatas) {
    await Promise.all(moduleDatas.map(p => this.addModule(p)));
  }

  /**
   * Picks out properties to return as the config set
   *
   * @returns {DocsConfigSet} docsConfigSet - Configuration for docs generation
   */
  getConfigSet() {
    const detailDocsConfigs = detailDocsTypes
      .reduce((acc, metaType) => ({ ...acc, [metaType]: this._flattenDetails(metaType) }), {});

    // sortByName
    // - project, scoped, non-scoped

    // structures
    // dirs, files x hidden, non-hidden
    return {
      app: this._app,
      plugins: sortModules(this._plugins),
      presets: sortModules(this._presets),
      modules: sortModules(this._modules),
      root: this._root,
      docsRoot: this._docsRoot,
      transforms: this._transforms,
      ...detailDocsConfigs
    };
  }
}

DocsConfigSetBuilder.docsSetupDefault = docsSetupDefault;

module.exports = DocsConfigSetBuilder;
