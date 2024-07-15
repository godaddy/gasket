import pluginHttps from '@gasket/plugin-https';
import pluginData from '@gasket/plugin-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginLint from '@gasket/plugin-lint';

/**
 * presetConfig hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @returns {Promise<CreateContext.presetConfig>} config
 */
export default async function presetConfig(gasket, context) {
  let typescriptPlugin;
  const testPlugins = [];
  // TODO: test canary publish without fastify dependency
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
      pluginHttps,
      pluginData,
      pluginWinston,
      pluginSwagger,
      pluginLint,
      frameworkPlugin.default || frameworkPlugin,
      typescriptPlugin ? typescriptPlugin.default || typescriptPlugin : null,
      ...testPlugins
    ].filter(Boolean)
  };
}
