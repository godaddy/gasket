/* eslint require-atomic-updates: warn */
const cloneDeep = require('lodash.clonedeep');
const isFunction = require('lodash.isfunction');
const isObject = require('lodash.isobject');

/**
 * Recurse through an object or array, and transform any functions to be empty
 *
 * @param {Object|Array} value - Item to consider
 * @returns {Object|Array} transformed result
 */
function sanitize(value) {
  if (isObject(value)) {
    Object.entries(value).forEach(([k, v]) => {
      if (isFunction(v)) {
        value[k] = function redacted() {
        };
      } else {
        sanitize(v);
      }
    });
  } else if (Array.isArray(value)) {
    value.forEach(v => sanitize(v));
  }

  return value;
}

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

      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginInfo = plugins[idx];
        plugins[idx] = await handler(pluginInfo);
      });
    }
  }
};
