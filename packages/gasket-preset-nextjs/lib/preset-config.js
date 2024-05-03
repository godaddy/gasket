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
  let testPlugin, typescriptPlugin;

  if ('testPlugin' in context) {
    testPlugin = await import(context.testPlugin);
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
      testPlugin ? testPlugin.default || testPlugin : null
    ].filter(Boolean)
  };
}
