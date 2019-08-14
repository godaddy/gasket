const path = require('path');

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const plugins = gasket._plugins;

      Object.keys(plugins).forEach(plugin => {
        const pluginName = plugin.name || plugin;
        try {
          const relativePath = gasket.resolver.tryResolvePluginRelativePath(pluginName);
          // Plugins that are defined locally to the app don't count
          if (pluginName.indexOf(gasket.config.root) !== -1) {
            return;
          }
          const pluginNameKey = pluginName;

          gasket.config.metadata.plugins[pluginNameKey] = { modulePath: relativePath };

          const pluginPath = path.resolve(relativePath);
          const pkg = require(path.join(pluginPath, 'package.json'));
          const { hooks } = require(pluginPath);
          gasket.config.metadata.plugins[pluginNameKey].pkg = pkg;
          gasket.config.metadata.plugins[pluginNameKey].hooks = hooks;

        } catch (err) { /* we don't care about the metadata for in-app plugins */ }
      });

      await gasket.execApply('metadata', async ({ name }, handler) => {
        gasket.config.metadata.plugins[name] = await handler(gasket.config.metadata.plugins[name]);
      });

      console.log(gasket.config.metadata.plugins)
    }

  }
}
