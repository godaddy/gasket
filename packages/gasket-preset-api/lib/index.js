import pluginExpress from '@gasket/plugin-express';
import pluginTypescript from '@gasket/plugin-typescript';
import pluginHttps from '@gasket/plugin-https';
import pluginWinston from '@gasket/plugin-winston';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginResponeData from '@gasket/plugin-response-data';

export default {
  name: '@gasket/preset-api',
  hooks: {
    async presetPrompt(gasket, context, { prompt }) {
      if (!('apiAppTest' in context)) {
        const { apiAppTest } = await prompt([
          {
            name: 'apiAppTest',
            message: 'What is your API app test?',
            type: 'input',
            default: 'A basic API'
          }
        ]);

        Object.assign(context, { apiAppTest, apiApp: true, typescript: true });
      }
    },
    async presetConfig(gasket, context) {
      return {
        plugins: [
          pluginExpress,
          pluginHttps,
          pluginWinston,
          pluginDocs,
          pluginDocusaurus,
          pluginResponeData,
          context.typescript ? pluginTypescript : null
        ].filter(Boolean)
      }
    }
  }
};
