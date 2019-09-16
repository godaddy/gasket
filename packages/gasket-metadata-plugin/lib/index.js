const cloneDeep = require('lodash.clonedeep');
const { sanitize } = require('./utils');

/**
 * Preset module with meta data
 *
 * @typedef {Object} Metadata
 * @property {ModuleInfo[]} app - App and main package info
 * @property {PresetInfo[]} presets - Preset infos with dependency hierarchy
 * @property {PluginInfo[]} plugins - Flat list of registered plugin infos
 */

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const { loader, config } = gasket;
      const { root = process.cwd() } = config;
      const loaded = loader.loadConfigured(config.plugins);
      const { presets, plugins } = sanitize(cloneDeep(loaded));
      const app = loader.getModuleInfo(null, root);

      /**
       * @type {Metadata}
       */
      gasket.metadata = {
        app,
        presets,
        plugins,
        modules: []
      };

      //
      // Allow plugins to tune their own metadata via lifecycle
      //
      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginInfo = plugins[idx];
        // eslint-disable-next-line require-atomic-updates
        plugins[idx] = await handler(pluginInfo);
      });

      // TODO (agerard): load moduleInfo for plugin modules

      //
      // assign plugin instances back to preset hierarchy to avoid faulty data
      //
      plugins.forEach(pluginInfo => {
        function checkPreset(presetInfo) {
          if (presetInfo.name === pluginInfo.from) {
            const idx = presetInfo.plugins.findIndex(p => p.name === pluginInfo.name);
            presetInfo.plugins[idx] = pluginInfo;
          }
          presetInfo.presets && presetInfo.presets.forEach(checkPreset);
        }
        presets.forEach(checkPreset);
      });
    }
  }
};
