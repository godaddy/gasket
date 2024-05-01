import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginResponseData from '@gasket/plugin-response-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginLint from '@gasket/plugin-lint';

export default async function presetConfig(gasket, context) {
  let testPlugin, typescriptPlugin;
  if ('testPlugin' in context) {
    testPlugin = await import(context.testPlugin);
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
      testPlugin ? testPlugin.default || testPlugin : null
    ].filter(Boolean)
  };
}
