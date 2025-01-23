// Default Plugins - included by default for all presets
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';

// Preset-specific Plugins
import pluginHttps from '@gasket/plugin-https';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginNext from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginLint from '@gasket/plugin-lint';

/**
 * presetConfig hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @returns {Promise<CreateContext.presetConfig>} config
 */
export default async function presetConfig(gasket, context) {
  let typescriptPlugin;

  const plugins = new Set([
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginGit,
    pluginLogger,
    pluginMetadata,
    pluginNext,
    pluginIntl,
    pluginWebpack,
    pluginWinston,
    pluginLint
  ]);

  if (context.nextServerType === 'customServer') {
    const frameworkPlugin = await import('@gasket/plugin-express');

    plugins.add(pluginHttps);
    plugins.add(frameworkPlugin.default || frameworkPlugin);
  } else if (context.nextDevProxy) {
    plugins.add(pluginHttpsProxy);
  }

  if (context.nextDevProxy) {
    plugins.add(pluginHttpsProxy);
  }

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.add(plugin ? plugin.default || plugin : null);
    }));
  }

  if (context.typescript) {
    typescriptPlugin = await import('@gasket/plugin-typescript');

    plugins.add(typescriptPlugin.default || typescriptPlugin);
  }

  return {
    plugins: Array.from(plugins)
  };
}
