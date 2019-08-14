const path = require('path');

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const plugins = gasket._plugins;
      const metadata = gasket.config.metadata.plugins;

      Object.keys(plugins).forEach(plugin => {
        // Plugins that are defined locally to the app don't count
        if (plugin.indexOf(gasket.config.root) !== -1) {
          return;
        }

        const relativePath = gasket.resolver.tryResolvePluginRelativePath(plugin);

        const pluginPath = path.resolve(relativePath);
        const pkg = require(path.join(pluginPath, 'package.json'));
        const { hooks } = require(pluginPath);

        metadata[plugin] = metadata[plugin] || {};
        Object.assign(metadata[plugin], pkg);
        metadata[plugin].hooks = hooks;
      });

      await gasket.execApply('metadata', async ({ name }, handler) => {
        metadata[name] = await handler(metadata[name]);
      });
    }
  }
};
