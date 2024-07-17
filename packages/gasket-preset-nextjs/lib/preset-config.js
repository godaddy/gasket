import pluginHttps from '@gasket/plugin-https';
import pluginNext from '@gasket/plugin-nextjs';
import pluginRedux from '@gasket/plugin-redux';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';

/**
 * presetConfig hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @returns {Promise<CreateContext.presetConfig>} config
 */
export default async function presetConfig(gasket, context) {
  let typescriptPlugin;
  const testPlugins = [];
  const frameworkPlugin = context.server === 'express'
    ? await import('@gasket/plugin-express')
    : await import('@gasket/plugin-fastify');

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      testPlugins.push(plugin ? plugin.default || plugin : null);
    }));
  }

  if (context.typescript) {
    typescriptPlugin = await import('@gasket/plugin-typescript');
  }

  return {
    plugins: [
      pluginWebpack,
      pluginHttps,
      pluginNext,
      pluginRedux,
      pluginWinston,
      frameworkPlugin.default || frameworkPlugin,
      typescriptPlugin ? typescriptPlugin.default || typescriptPlugin : null,
      ...testPlugins
    ].filter(Boolean)
  };
}
