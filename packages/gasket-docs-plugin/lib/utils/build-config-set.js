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

/**
 * Searches for the pluginInfo from metadata for a given plugin.
 * If the plugin does not have a name, a unique match by hooks is attempted,
 * otherwise a console warning is issued.
 *
 * @param {Plugin} plugin - Plugin instance to look up info for
 * @param {PluginInfo[]} pluginsInfos - Metadata for plugins
 * @returns {PluginInfo|undefined} pluginsInfo
 */
function findPluginInfo(plugin, pluginsInfos) {
  const { name } = plugin;
  // If the plugin does not have a name, try to find a unique hooks match
  if (!name) {
    const expectedHooks = Object.keys(plugin.hooks);
    const results = pluginsInfos.filter(pluginInfo => {
      const actual = Object.keys(pluginInfo.module.hooks);
      return expectedHooks.length === actual.length && actual.every(k => expectedHooks.includes(k));
    });
    if (!results.length || results.length > 1) {
      console.error(`Plugin missing name. Unable to find plugin with unique hooks: ${JSON.stringify(expectedHooks)}`);
    } else {
      console.log(`Determined plugin with missing name to be: ${results[0].name}`);
      return results[0];
    }
  } else {
    return pluginsInfos.find(p => p.module.name === name || p.name === name);
  }
}

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
    this.gasket = gasket;
    this.plugins = [];
    this.presets = [];
    this.modules = [];
    this.transforms = [];

    const { root = process.cwd(), docs: { outputDir } } = gasket.config;
    this.root = root;
    this.docsRoot = path.join(root, outputDir);
  }

  /**
   * Look up all doc files for a module
   *
   * @param {ModuleInfo} moduleInfo - Metadata for a module
   * @param {DocsSetup} docsSetup - Docs setup
   * @returns {Promise<string[]>} files
   * @private
   */
  async _findAllFiles(moduleInfo, docsSetup) {
    const { link, sourceRoot } = docsSetup;

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
        this.transforms.push(tx);
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
   * @returns {DocsConfig} docsConfigs
   * @private
   */
  async _buildDocsConfig(moduleInfo, docsSetup = {}) {
    // If doc not specified in metadata, use from options, otherwise fallback
    // homepage from package.json if it exists
    const {
      link = docsSetup.link || moduleInfo.package && moduleInfo.package.homepage,
      version
    } = moduleInfo;

    // In some cases, the these may have already been pre configured in setup.
    const {
      name = moduleInfo.name,
      sourceRoot = moduleInfo.path
    } = docsSetup;

    // Get only the local transforms
    const transforms = this._segregateTransforms(docsSetup.transforms || []);

    const description = docsSetup.description || moduleInfo.description ||
      moduleInfo.package && moduleInfo.package.description;

    const docConfig = {
      ...docsSetup,
      name,
      version,
      description,
      link,
      sourceRoot,
      transforms
    };

    const files = await this._findAllFiles(moduleInfo, { ...docsSetup, sourceRoot });

    return {
      ...docConfig,
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
    this.plugins.forEach(pluginDoc => {
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
   * Add DocsConfig to the set for a plugin
   *
   * @param {PluginInfo} pluginInfo - Metadata for plugin
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addPlugin(pluginInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    let { name, path: sourceRoot } = pluginInfo;
    let targetRoot = path.join(this.docsRoot, 'plugins', ...name.split('/'));
    if (isAppPlugin.test(pluginInfo.name)) {
      name = path.relative(this.root, name);
      sourceRoot = path.join(this.root);
      targetRoot = path.join(this.docsRoot, 'app');
    }
    const docConfig = await this._buildDocsConfig(pluginInfo, { ...docsSetup, targetRoot, name, sourceRoot });
    this.plugins.push(docConfig);

    // TODO (agerard): handle modules from metadata and/or docsSetup
  }

  /**
   * Add DocsConfig to the set for multiple plugins
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
  async addPreset(presetInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    const { name } = presetInfo;
    const targetRoot = path.join(this.docsRoot, 'presets', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(presetInfo, { ...docsSetup, targetRoot });
    this.presets.push(docConfig);
  }

  /**
   * Add DocsConfig to the set for multiple presets
   *
   * @param {PresetInfo[]} presetInfos - Metadata for multiple presets
   * @async
   */
  async addPresets(presetInfos) {
    await Promise.all(presetInfos.map(p => this.addPreset(p)));
  }

  /**
   * Add DocsConfig to the set for the App
   *
   * @param {ModuleInfo} moduleInfo - Metadata for app module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addApp(moduleInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    const targetRoot = path.join(this.docsRoot, 'app');
    this.app = await this._buildDocsConfig(moduleInfo, { ...docsSetup, targetRoot });
  }

  /**
   * Add DocsConfig to the set for a module
   *
   * @param {ModuleInfo} moduleInfo - Metadata for a module
   * @param {DocsSetup} docsSetup - Initial docs setup
   * @async
   */
  async addModule(moduleInfo, docsSetup = {}) {
    const { name } = moduleInfo;
    const targetRoot = path.join(this.docsRoot, 'modules', ...name.split('/'));
    const docConfig = await this._buildDocsConfig(moduleInfo, { ...docsSetup, targetRoot });
    this.modules.push(docConfig);
  }

  async addModules(moduleInfos) {
    await Promise.all(moduleInfos.map(p => this.addModule(p)));
  }

  /**
   * Picks out properties to return as the config set
   *
   * @returns {DocsConfigSet} docsConfigSet - Configuration for docs generation
   */
  getConfigSet() {
    const { app, plugins, presets, modules, root, docsRoot, transforms } = this;
    const subDocsConfigs = subDocTypes.reduce((acc, metaType) => ({
      ...acc,
      [metaType]: this._flattenSubType(metaType)
    }), {});
    return { app, plugins, presets, modules, ...subDocsConfigs, root, docsRoot, transforms };
  }
}

/**
 * Processes metadata and docsSetup hooks to assemble the set of docs configs
 *
 * Order of operations for building docsConfig:
 *   - docsSetup hooked plugins
 *   - metadata or docsSetup lifecycle file for app
 *   - metadata for plugins without docsSetup hook
 *   - metadata for modules not processed with plugins
 *   - metadata for presets
 *
 * @param {Gasket} gasket - Gasket API
 * @returns {DocsConfigSet} docsConfigSet
 */
async function buildDocsConfigSet(gasket) {
  const { metadata } = gasket;
  const { app: appInfo } = metadata;
  const builder = new DocsConfigSetBuilder(gasket);

  await gasket.execApply('docsSetup', async (plugin, handler) => {
    //
    // If this is a lifecycle file, use it to modify the app-level docConfig
    //
    if (!plugin) {
      const docsSetup = await handler();
      return await builder.addApp(appInfo, docsSetup);
    }

    const pluginInfo = findPluginInfo(plugin, metadata.plugins);
    if (pluginInfo) {
      const docsSetup = await handler();
      await builder.addPlugin(pluginInfo, docsSetup);
    }
  });

  //
  // If app's docsConfig was not built during lifecycle hook, do it now
  //
  if (!builder.app) {
    await builder.addApp(appInfo);
  }

  const remainingPlugins = metadata.plugins.filter(p => !builder.plugins.find(d => d.metadata === p));
  await builder.addPlugins(remainingPlugins);

  const remainingModules = metadata.modules.filter(p => !builder.modules.find(d => d.metadata === p));
  await builder.addModules(remainingModules);

  await builder.addPresets(metadata.presets);

  return builder.getConfigSet();
}

module.exports = buildDocsConfigSet;
module.exports.findPluginInfo = findPluginInfo;
module.exports.DocsConfigSetBuilder = DocsConfigSetBuilder;
