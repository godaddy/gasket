/* eslint-disable no-sync */
import * as path from 'path';

export default {
  timing: {
    before: ['@gasket/plugin-command']
  },
  handler: async function prepare(gasket, config) {
    const dynamicPlugins = (config.dynamicPlugins ?? []).filter(Boolean);

    if (!dynamicPlugins.length) return config;

    const imported = await Promise.all(dynamicPlugins.map(pluginName => {
      if (pluginName.startsWith('.')) {
        const absolutePath = path.resolve(gasket.config.root, pluginName);
        return import(absolutePath).then(mod => mod.default);
      }
      return import(pluginName).then(mod => mod.default);
    }));

    imported.forEach(mod => {
      config.plugins.push(mod);
    });

    gasket.engine.registerPlugins(config.plugins);

    gasket.execApplySync('init', function (plugin, handler) {
      if (imported.includes(plugin)) {
        handler();
      }
    });

    gasket.execApplySync('configure', function (plugin, handler) {
      if (imported.includes(plugin)) {
        config = handler(config);
      }
    });

    return config;
  }
};
