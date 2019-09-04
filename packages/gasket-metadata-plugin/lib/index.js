/* eslint require-atomic-updates: warn */
const cloneDeep = require('lodash.clonedeep');
const { sanitize } = require('./utils');

/**
 * Preset module with meta data
 *
 * @typedef {Object} Metadata
 * @property {PresetInfo[]} presets - Preset infos with dependency hierarchy
 * @property {PluginInfo[]} plugins - Flat list of registered plugin infos
 */

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const { loader, config } = gasket;
      const loaded = loader.loadConfigured(config.plugins);
      const { presets, plugins } = sanitize(cloneDeep(loaded));

      /**
       * @type {Metadata}
       */
      gasket.metadata = {
        presets,
        plugins
      };

      //
      // Allow plugins to tune their own metadata via lifecycle
      //
      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginInfo = plugins[idx];
        plugins[idx] = await handler(pluginInfo);
      });

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
