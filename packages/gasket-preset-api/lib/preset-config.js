// Default Plugins
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';

import pluginHttps from '@gasket/plugin-https';
import pluginLint from '@gasket/plugin-lint';
import pluginWinston from '@gasket/plugin-winston';

/** @type {import('@gasket/core').HookHandler<'presetConfig'>} */
export default async function presetConfig(gasket, context) {
  const plugins = new Set([
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginGit,
    pluginHttps,
    pluginLint,
    pluginLogger,
    pluginMetadata,
    pluginWinston
  ]);

  const frameworkPlugin = await import(context.server === 'express' ? '@gasket/plugin-express' : '@gasket/plugin-fastify');

  plugins.add(frameworkPlugin.default || frameworkPlugin);

  if (context.testPlugins?.length) {
    const testPlugins = await Promise.all(
      context.testPlugins.map(async (testPlugin) => {
        const plugin = await import(testPlugin);

        return plugin.default || plugin;
      })
    );

    testPlugins.filter(Boolean).forEach((plugin) => plugins.add(plugin));
  }

  if (context.typescript) {
    const { default: typescriptPlugin = null } = await import('@gasket/plugin-typescript');

    if (typescriptPlugin) plugins.add(typescriptPlugin);
  }

  if (context.useSwagger) {
    const { default: swaggerPlugin = null } = await import('@gasket/plugin-swagger');

    if (swaggerPlugin) plugins.add(swaggerPlugin);
  }

  return {
    plugins: Array.from(plugins)
  };
}
