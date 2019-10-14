const cloneDeep = require('lodash.clonedeep');
const {
  sanitize,
  loadAppModules,
  loadPluginModules,
  flattenPluginModules,
  fixupPresetHierarchy,
  expandPresetMetadata
} = require('./utils');

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const { loader, config } = gasket;
      const { root = process.cwd() } = config;
      const loaded = loader.loadConfigured(config.plugins);
      const { presets, plugins } = sanitize(cloneDeep(loaded));
      const app = loader.getModuleInfo(null, root);
      const modules = [];

      /**
       * @type {Metadata}
       */
      gasket.metadata = {
        app,
        presets,
        plugins,
        modules
      };

      loadAppModules(loader, app, modules);
      expandPresetMetadata(presets);

      //
      // Allow plugins to tune their own metadata via lifecycle
      //
      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginData = await handler(plugins[idx]);

        loadPluginModules(pluginData, loader);
        flattenPluginModules(pluginData, modules);
        fixupPresetHierarchy(pluginData, presets);

        // eslint-disable-next-line require-atomic-updates
        plugins[idx] = pluginData;
      });
    },
    metadata(gasket, pluginData) {
      return {
        ...pluginData,
        lifecycles: [{
          name: 'metadata',
          method: 'execApply',
          description: 'Allows plugins to adjust their metadata',
          link: 'README.md#metadata'
        }]
      };
    }
  }
};
