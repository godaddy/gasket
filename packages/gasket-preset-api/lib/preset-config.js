// Default Plugins - included by default for all presets
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';

// Preset-specific Plugins
import pluginHttps from '@gasket/plugin-https';
import pluginWinston from '@gasket/plugin-winston';

/**
 * presetConfig hook
 * @type {import('@gasket/core').PresetHook<'presetConfig'>}
 */
export default async function presetConfig(gasket, context) {
  const plugins = new Set([
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginHttps,
    pluginLogger,
    pluginWinston
  ]);

  const frameworkPlugin = context.server === 'express'
    ? await import('@gasket/plugin-express')
    : await import('@gasket/plugin-fastify');

  plugins.add(frameworkPlugin.default || frameworkPlugin);

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.add(plugin ? plugin.default || plugin : null);
    }));
  }

  if (context.typescript) {
    const typescriptPlugin = await import('@gasket/plugin-typescript');
    plugins.add(typescriptPlugin.default || typescriptPlugin);
  }

  if (context.useSwagger) {
    const swaggerPlugin = await import('@gasket/plugin-swagger');
    plugins.add(swaggerPlugin.default || swaggerPlugin);
  }

  return {
    plugins: Array.from(plugins)
  };
}
