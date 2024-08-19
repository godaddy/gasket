import pluginHttps from '@gasket/plugin-https';
import pluginData from '@gasket/plugin-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginLint from '@gasket/plugin-lint';

/**
 * presetConfig hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @returns {Promise<CreateContext.presetConfig>} config
 */
export default async function presetConfig(gasket, context) {
  const plugins = [
    pluginHttps,
    pluginData,
    pluginWinston,
    pluginLint
  ];

  const frameworkPlugin = context.server === 'express'
    ? await import('@gasket/plugin-express')
    : await import('@gasket/plugin-fastify');

  plugins.push(frameworkPlugin.default || frameworkPlugin);

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.push(plugin ? plugin.default || plugin : null);
    }));
  }

  if (context.typescript) {
    const typescriptPlugin = await import('@gasket/plugin-typescript');
    plugins.push(typescriptPlugin.default || typescriptPlugin);
  }

  if (context.useSwagger) {
    const swaggerPlugin = await import('@gasket/plugin-swagger');
    plugins.push(swaggerPlugin.default || swaggerPlugin);
  }

  return {
    plugins: plugins.filter(Boolean)
  };
}
