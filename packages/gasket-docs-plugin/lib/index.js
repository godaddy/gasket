const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const glob = promisify(require('glob'));
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));


const mdTable = require('markdown-table');


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

  async _findAllFiles(moduleInfo, docOpts) {
    const { doc, files = [], sourceRoot } = docOpts;

    const noHash = filename => filename.split('#')[0];
    const fileSet = new Set(files);

    const tryAdd = maybeDoc => {
      if (Boolean(maybeDoc) && !isUrl.test(maybeDoc)) {
        fileSet.add(noHash(maybeDoc));
      }
    };

    // Add file for main doc if not a url
    tryAdd(doc);

    // Add files for sub meta types docs
    META_TYPES.forEach(metaType => {
      if (metaType in moduleInfo) {
        moduleInfo[metaType].forEach(o => {
          tryAdd(o.doc);
        });
      }
    });

    let { includes = [] } = docOpts;
    includes = Array.isArray(includes) ? includes : [includes];

    (await Promise.all(includes.map(async g => await glob(g, { cwd: sourceRoot }))))
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
   * @param {Object} docOpts - Includes and doc defaults
   * @returns {DocsConfig} docsConfigs
   */
  async _buildConfig(moduleInfo, docOpts = {}) {
    // If doc not specified in metadata, use from options, otherwise fallback
    // homepage from package.json if it exists
    const {
      doc = docOpts.doc || moduleInfo.package && moduleInfo.package.homepage,
      version
    } = moduleInfo;

    // In some cases, the these may have already been pre configured.
    const {
      name = moduleInfo.name,
      sourceRoot = moduleInfo.path
    } = docOpts;

    const transforms = this._separateTransforms(docOpts.transforms || []);

    const description = docOpts.description || moduleInfo.description ||
      moduleInfo.package && moduleInfo.package.description;

    const docConfig = {
      ...docOpts,
      name,
      version,
      description,
      doc,
      sourceRoot,
      transforms
    };

    const files = await this._findAllFiles(moduleInfo, { ...docOpts, sourceRoot });

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
   * @returns {Array} flattened
   * @private
   */
  _flattenMetaType(metaType) {
    const arr = [];
    this.plugins.forEach(pluginDoc => {
      const { sourceRoot, targetRoot, name: from } = pluginDoc;
      arr.push(
        ...(pluginDoc.metadata[metaType] || []).map(doc => ({
          ...doc,
          from,
          sourceRoot,
          targetRoot
        }))
      );
    });
    return arr;
  }

  async addPlugin(pluginInfo, docOpts = { doc: 'README.md', includes: ['docs/**/*'] }) {
    let { name, path: sourceRoot } = pluginInfo;
    let targetRoot = path.join(this.docsRoot, 'plugins', ...name.split('/'));
    if (isAppPlugin.test(pluginInfo.name)) {
      name = path.relative(this.root, name);
      sourceRoot = path.join(this.root);
      targetRoot = path.join(this.docsRoot, 'app');
    }
    const docConfig = await this._buildConfig(pluginInfo, { ...docOpts, targetRoot, name, sourceRoot });
    this.plugins.push(docConfig);

    // TODO (agerard): handle modules in docOptions
  }

  async addPlugins(pluginInfos) {
    await Promise.all(pluginInfos.map(p => this.addPlugin(p)));
  }

  async addPreset(presetInfo, docOpts = { doc: 'README.md', includes: ['docs/**/*'] }) {
    const { name } = presetInfo;
    const targetRoot = path.join(this.docsRoot, 'presets', ...name.split('/'));
    const docConfig = await this._buildConfig(presetInfo, { ...docOpts, targetRoot });
    this.presets.push(docConfig);
  }

  async addPresets(presetInfos) {
    await Promise.all(presetInfos.map(p => this.addPreset(p)));
  }

  async addApp(moduleInfo, docOpts = { doc: 'README.md', includes: ['docs/**/*'] }) {
    const targetRoot = path.join(this.docsRoot, 'app');
    this.app = await this._buildConfig(moduleInfo, { ...docOpts, targetRoot });
  }

  async addModule(moduleInfo, docOpts = {}) {
    const { name } = moduleInfo;
    const targetRoot = path.join(this.docsRoot, 'modules', ...name.split('/'));
    const docConfig = await this._buildConfig(moduleInfo, { ...docOpts, targetRoot });
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
async function buildDocsConfig(gasket) {
  const { metadata } = gasket;
  const builder = new DocsConfigBuilder(gasket);

  const { app: appInfo } = metadata;
  /**
   * specify what files to include to generate, and what transforms.
   */
  await gasket.execApply('docs', async (plugin, handler) => {
    // If this is a lifecycle file, use it to modify the app-level docConfig
    if (!plugin) {
      const docOpts = await handler();
      return await builder.addApp(appInfo, docOpts);
    }

    const pluginInfo = findPluginInfo(plugin, metadata.plugins);
    if (pluginInfo) {
      const docOpts = await handler();
      await builder.addPlugin(pluginInfo, docOpts);
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
}

async function generateFiles(moduleDoc, docsConfig) {
  const { transforms: gTransforms = [] } = docsConfig;
  const { sourceRoot, targetRoot, files, transforms = [] } = moduleDoc;

  const allTransforms = gTransforms.concat(transforms);

  await Promise.all(files.map(async file => {
    const source = path.join(sourceRoot, file);
    const target = path.join(targetRoot, file);
    await mkdirp(path.dirname(target));

    // Process all files which meet transform tests
    if (allTransforms.some(tx => tx.test.test(source))) {
      let content = await readFile(source, 'utf8');
      content = allTransforms.reduce((acc, tx) => {
        if (tx.test.test(source)) {
          return tx.handler(acc, { source, target, moduleDoc, docsConfig });
        }
        return content;
      }, content);
      return await writeFile(target, content);
    } else {
      await copyFile(source, target);
    }
  }));
}

async function generateDocFiles(docsConfig) {
  const { docsRoot } = docsConfig;
  await mkdirp(docsRoot);
  await rimraf(path.join(docsRoot, '*'));

  // flatten the moduleDocs then generate
  const flattened = ['plugins', 'presets', 'modules'].reduce((acc, type) => {
    return acc.concat(docsConfig[type]);
  }, [docsConfig.app]);

  await Promise.all(flattened.map(d => generateFiles(d, docsConfig)));
}



async function generateIndex(docsConfig) {
  const { app: appDocs, docsRoot } = docsConfig;

  const links = [];
  let content = '';

  const addLine = (text = '') => { content += text + '\n'; };
  const addContent = (text = '') => { addLine(text); addLine(); };
  const addTable = elems => { addContent(mdTable(elems)); };
  const formatLink = (doc, targetRoot) => isUrl.test(doc) ? doc : path.relative(docsRoot, path.join(targetRoot, doc));

  addContent('<!-- generated by `gasket docs` -->');
  addContent('# App');
  addContent(`[${appDocs.name}] — ${appDocs.description}`);
  links.push([appDocs.name, formatLink(appDocs.doc, appDocs.targetRoot)]);
  // addContent(appDocs.description || '');

  const addSection = (sectionTitle, sectionDesc, docs, { includeVersion = true } = {}) => {
    if (!docs || !docs.length) return;

    addContent(`## ${sectionTitle}`);
    addContent(sectionDesc);
    addTable([
      includeVersion ? ['Name', 'Version', 'Description'] : ['Name', 'Description'],
      ...docs.map(moduleDoc => {
        const { name, description, doc, version, targetRoot } = moduleDoc;
        if (doc) {
          links.push([name, formatLink(doc, targetRoot)]);
        }
        return [doc ? `[${name}]` : name, ...(includeVersion ? [version, description] : [description])];
      })
    ]);
  };

  addSection('Commands', 'Available commands', docsConfig.commands, { includeVersion: false });
  addSection('Lifecycles', 'Available lifecycles', docsConfig.lifecycles, { includeVersion: false });
  addSection('Structure', 'Available structure', docsConfig.structures, { includeVersion: false });
  addSection('Plugins', 'All configured plugins', docsConfig.plugins);
  addSection('Presets', 'All configured presets', docsConfig.presets);
  addSection('Modules', 'Some available modules', docsConfig.modules);

  addContent('<!-- LINKS -->');
  links.forEach(([name, link]) => {
    addLine(`[${name}]:${link}`);
  });

  return await writeFile(path.join(docsRoot, 'README.md'), content);
}

module.exports = {
  name: 'docs',
  hooks: {
    configure: require('./configure'),
    getCommands: function getCommandsHook(gasket, { BaseCommand }) {
      class DocsCommand extends BaseCommand {
        async runHooks() {
          const docsConfig = await buildDocsConfig(gasket);
          await generateDocFiles(docsConfig);
          await generateIndex(docsConfig);

          // console.log('--- docsConfig ---');
          // console.log(docsConfig);

          await gasket.exec('docsView', docsConfig);
        }
      }

      DocsCommand.id = 'docs';
      DocsCommand.description = 'Generate docs for the app';

      return DocsCommand;
    },
    metadata: function metadataHook(gasket, meta) {
      const { dir } = gasket.config.docs;
      return {
        ...meta,
        commands: [{
          name: 'docs',
          description: 'Collocates documentation from configured presets and plugins',
          doc: 'README.md#commands'
        }],
        lifecycles: [{
          name: 'docs',
          description: 'Adjust what docs are captured and how to transform them',
          doc: 'README.md#docs-1'
        }, {
          name: 'docsView',
          description: 'View the collocated documentation',
          doc: 'README.md#docsView'
        }],
        structures: [{
          name: dir,
          description: 'Output of gasket docs command'
        }]
      };
    },
    /**
     * Specify what files to copy and transform
     *
     * @param {Gasket} gasket - Gasket API
     * @returns {{patterns: string[], files: string[]}}
     */
    docs: function docsHook() {
      return {
        doc: 'README.md',
        includes: [
          'README.md',
          'CHANGELOG.md',
          'docs/**/*',
          'more-docs/**/*'
        ],
        transforms: [{
          global: true,
          test: /(node_modules\/@gasket|packages\/gasket-.+)\/.+\.md$/,
          handler: (content, { docsConfig }) => {
            //
            // normalize all relative /packages links back to repo urls
            //
            content = content.replace(/(]\s?:\s?|]\()(\/packages\/)(gasket-.+)(\/.+)/g, (match, p1, p2, p3, p4) => {
              return [p1, 'https://github.com/godaddy/gasket/tree/master/packages/', p3, p4].join('');
            });

            //
            // for any packages that have been collocated, make relative links, otherwise leave as github urls
            //
            content = content.replace(/(]\s?:\s?|]\()(https:\/\/github.com\/godaddy\/gasket\/tree\/.+\/packages\/)(gasket-.+)(\/.+)/g, (match, p1, p2, p3, p4) => {
              const modName = p3.replace('gasket-', '@gasket/');
              const tgtDoc = docsConfig.plugins.concat(docsConfig.modules).find(m => m.name === modName);
              if (tgtDoc) {
                const relRoot = path.relative(docsConfig.docsRoot, tgtDoc.targetRoot);
                return [p1, relRoot, p4].join('');
              }
              return match;
            });
            return content;
          }
        }]
      };
    },
    docsView: require('./docs-view')
  }
};
