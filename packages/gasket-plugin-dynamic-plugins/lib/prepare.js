export default {
  timing: {
    before: ['@gasket/plugin-command']
  },
  handler: async function prepare(gasket, config) {
    const dynamicPlugins = (config.dynamicPlugins ?? []).filter(Boolean);

    if (!dynamicPlugins.length) return config;

    const load = await Promise.all(dynamicPlugins.map(plugin => import(plugin)));
    load.forEach(mod => {
      config.plugins.push(mod.default);
    });
    gasket.engine.registerPlugins(config.plugins);
    // eslint-disable-next-line no-sync
    gasket.execApplySync('init', function (plugin, handler) {
      if (dynamicPlugins.includes(plugin.name)) {
        handler();
      }
    });
    // eslint-disable-next-line no-sync
    gasket.execApplySync('configure', async function (plugin, handler) {
      if (dynamicPlugins.includes(plugin.name)) {
        config = handler(config);
      }
    });

    return config;
  }
};
