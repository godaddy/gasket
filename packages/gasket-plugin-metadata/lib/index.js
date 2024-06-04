const path = require('path');
const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const { name, version, description } = require('../package');

module.exports = {
  name,
  version,
  description,
  hooks: {
    // TODO: convert to a getMetadata action
    actions(gasket) {
      return {
        async getMetadata() {
          const { config: { root } } = gasket;

          let app;
          const tryPath = isModulePath.test(root) ? path.join(root, 'package.json') : `${root}/package.json`;
          try {
            const pkgPath = require.resolve(tryPath, { paths: [root] });
            const pkg = require(pkgPath);
            app = {
              path: path.dirname(pkgPath),
              package: pkg,
              version: pkg.version,
              name: pkg.name
            };
          } catch (err) {
            console.log(err);
          }


          const plugins = [];
          const modules = [];
          const presets = [];
          await gasket.execApply('metadata', async (data, handler) => {
            const pluginData = await handler(data);
            pluginData.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
            plugins.push(pluginData);

            if (pluginData.modules) {
              pluginData.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
              const data = pluginData.modules.map(m => ({ ...m, path: path.dirname(path.join(require.resolve(m.name), '..')) }));
              modules.push(...data);
            }
          });

          return { app, plugins, modules, presets };
        }
      }
    },
    // async init(gasket) {
    //   const { loader, config } = gasket;
    //   const { root = process.cwd() } = config;
    //   const loaded = loader.loadConfigured(config.plugins);
    //   const { presets, plugins } = sanitize(cloneDeep(loaded));
    //   const app = loader.getModuleInfo(null, root);
    //   const modules = [];

    //   /**
    //    * @type {Metadata}
    //    */
    //   gasket.metadata = {
    //     app,
    //     presets,
    //     plugins,
    //     modules
    //   };

    //   loadAppModules(loader, app, modules);
    //   expandPresetMetadata(presets);
    //   expandPackageMetadata([app]);
    //   expandPackageMetadata(plugins);

    //   //
    //   // Allow plugins to tune their own metadata via lifecycle
    //   //
    //   await gasket.execApply('metadata', async ({ name }, handler) => {
    //     const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
    //     const pluginData = await handler(plugins[idx]);

    //     loadPluginModules(pluginData, loader);
    //     flattenPluginModules(pluginData, modules);
    //     fixupPresetHierarchy(pluginData, presets);

    //     // eslint-disable-next-line require-atomic-updates
    //     plugins[idx] = pluginData;
    //   });

    //   expandPackageMetadata(modules);
    // },
    metadata(gasket, meta) {
      const mod = require('@gasket/core/package.json')
      return {
        ...meta,
        lifecycles: [{
          name: 'metadata',
          method: 'execApply',
          description: 'Allows plugins to adjust their metadata',
          link: 'README.md#metadata',
          parent: 'init'
        }],
        modules: [
          {
            name: mod.name,
            version: mod.version,
            description: mod.description,
            link: 'README.md'
          }
        ]
      };
    }
  }
};
