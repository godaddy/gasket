import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginResponseData from '@gasket/plugin-response-data';
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
  let testPlugins = [];

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
      pluginExpress,
      pluginHttps,
      pluginDocs,
      pluginDocusaurus,
      pluginResponseData,
      pluginWinston,
      pluginSwagger,
      pluginLint,
      typescriptPlugin ? typescriptPlugin.default || typescriptPlugin : null,
      ...testPlugins
    ].filter(Boolean)
  };
}
