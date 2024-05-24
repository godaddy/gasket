import pluginExpress from '@gasket/plugin-express';
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
      pluginExpress,
      pluginHttps,
      pluginNext,
      pluginRedux,
      pluginWinston,
      typescriptPlugin ? typescriptPlugin.default || typescriptPlugin : null,
      ...testPlugins
    ].filter(Boolean)
  };
}
