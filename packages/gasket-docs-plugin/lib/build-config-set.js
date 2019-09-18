const path = require('path');
const { promisify } = require('util');

const glob = promisify(require('glob'));

const isAppPlugin = /^\/.+\/plugins\//;
const isUrl = /^(https?:)?\/\//;


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

const META_TYPES = [
  'commands',
  'structures',
  'lifecycles'
];

class DocsConfigBuilder {
  constructor(gasket) {
    this.gasket = gasket;
    this.plugins = [];
    this.presets = [];
    this.modules = [];
    this.transforms = [];

    const { root = process.cwd(), docs: { dir } } = gasket.config;
    this.root = root;
    this.docsRoot = path.join(root, dir);
  }

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
    META_TYPES.forEach(metaType => {
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

  _separateTransforms(transforms) {
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
   *
   * @param {ModuleInfo} moduleInfo -
   * @param {DocsSetup} docsSetup - Includes and doc defaults
   * @returns {DocsConfig} docsConfigs
   */
  async _buildConfig(moduleInfo, docsSetup = {}) {
    // If doc not specified in metadata, use from options, otherwise fallback
    // homepage from package.json if it exists
    const {
      link = docsSetup.link || moduleInfo.package && moduleInfo.package.homepage,
      version
    } = moduleInfo;

    // In some cases, the these may have already been pre configured.
    const {
      name = moduleInfo.name,
      sourceRoot = moduleInfo.path
    } = docsSetup;

    const transforms = this._separateTransforms(docsSetup.transforms || []);

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
   * @param {String} metaType - Sub type in metadata
   * @returns {DocsConfig[]} flattened
   * @private
   */
  _flattenMetaType(metaType) {
    const arr = [];
    this.plugins.forEach(pluginDoc => {
      const { sourceRoot, targetRoot, name: from } = pluginDoc;
      arr.push(
        ...(pluginDoc.metadata[metaType] || []).map(docsSetup => ({
          ...docsSetup,
          from,
          sourceRoot,
          targetRoot
        }))
      );
    });
    return arr;
  }

  async addPlugin(pluginInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    let { name, path: sourceRoot } = pluginInfo;
    let targetRoot = path.join(this.docsRoot, 'plugins', ...name.split('/'));
    if (isAppPlugin.test(pluginInfo.name)) {
      name = path.relative(this.root, name);
      sourceRoot = path.join(this.root);
      targetRoot = path.join(this.docsRoot, 'app');
    }
    const docConfig = await this._buildConfig(pluginInfo, { ...docsSetup, targetRoot, name, sourceRoot });
    this.plugins.push(docConfig);

    // TODO (agerard): handle modules from metadata
    // TODO (agerard): handle modules from docsSetup
  }

  async addPlugins(pluginInfos) {
    await Promise.all(pluginInfos.map(p => this.addPlugin(p)));
  }

  async addPreset(presetInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    const { name } = presetInfo;
    const targetRoot = path.join(this.docsRoot, 'presets', ...name.split('/'));
    const docConfig = await this._buildConfig(presetInfo, { ...docsSetup, targetRoot });
    this.presets.push(docConfig);
  }

  async addPresets(presetInfos) {
    await Promise.all(presetInfos.map(p => this.addPreset(p)));
  }

  async addApp(moduleInfo, docsSetup = { link: 'README.md', includes: ['docs/**/*'] }) {
    const targetRoot = path.join(this.docsRoot, 'app');
    this.app = await this._buildConfig(moduleInfo, { ...docsSetup, targetRoot });
  }

  async addModule(moduleInfo, docsSetup = {}) {
    const { name } = moduleInfo;
    const targetRoot = path.join(this.docsRoot, 'modules', ...name.split('/'));
    const docConfig = await this._buildConfig(moduleInfo, { ...docsSetup, targetRoot });
    this.modules.push(docConfig);
  }

  async addModules(moduleInfos) {
    await Promise.all(moduleInfos.map(p => this.addModule(p)));
  }

  /**
   * Picks out properties to return as the config
   *
   * @returns {DocsConfig} docsConfig - Configuration for docs generation
   */
  getConfig() {
    const { app, plugins, presets, modules, root, docsRoot, transforms } = this;
    const metaTypes = META_TYPES.reduce((acc, metaType) => ({ ...acc, [metaType]: this._flattenMetaType(metaType) }), {});
    return { app, plugins, presets, modules, root, docsRoot, ...metaTypes, transforms };
  }
}

/**
 * Build the docs configuration
 *
 * Order of operations:
 *   execute docs hook
 *   construct config for hooked plugins
 *   construct config for remaining non-hooked plugins in metadata
 *   construct config for presets
 *   construct config for modules
 *
 * @param {Gasket} gasket - Gasket API
 * @returns {DocsConfig} docsConfig
 */
module.exports = async function buildDocsConfigSet(gasket) {
  const { metadata } = gasket;
  const builder = new DocsConfigBuilder(gasket);

  const { app: appInfo } = metadata;
  /**
   * specify what files to include to generate, and what transforms.
   */
  await gasket.execApply('docs', async (plugin, handler) => {
    // If this is a lifecycle file, use it to modify the app-level docConfig
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

  // If app's docsConfig were not built during lifecycle
  if (!builder.app) {
    await builder.addApp(appInfo);
  }

  const remainingPlugins = metadata.plugins.filter(p => !builder.plugins.find(d => d.metadata === p));
  await builder.addPlugins(remainingPlugins);

  const remainingModules = metadata.modules.filter(p => !builder.modules.find(d => d.metadata === p));
  await builder.addModules(remainingModules);

  await builder.addPresets(metadata.presets);

  return builder.getConfig();
};
