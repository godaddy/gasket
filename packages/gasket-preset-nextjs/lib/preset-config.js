import pluginHttps from '@gasket/plugin-https';
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

  const plugins = [
    pluginHttps,
    pluginNext,
    pluginIntl,
    pluginWebpack,
    pluginWinston,
    pluginLint
  ];

  if ('server' in context) {
    const frameworkPlugin = context.server === 'express'
      ? await import('@gasket/plugin-express')
      : await import('@gasket/plugin-fastify');

    plugins.push(frameworkPlugin.default || frameworkPlugin);
  }

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.push(plugin ? plugin.default || plugin : null);
    }));
  }

  if (context.typescript) {
    typescriptPlugin = await import('@gasket/plugin-typescript');

    plugins.push(typescriptPlugin.default || typescriptPlugin);
  }

  return {
    plugins: plugins.filter(Boolean)
  };
}
