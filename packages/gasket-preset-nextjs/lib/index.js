import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginNext from '@gasket/plugin-nextjs';
import pluginRedux from '@gasket/plugin-redux';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, dependencies } = require('../package.json');

export default {
  name,
  hooks: {
    async presetPrompt(gasket, context, { prompt }) {
      if (!('typescript' in context)) {
        const { typescript } = await prompt([
          {
            name: 'typescript',
            message: 'Do you want to use TypeScript?',
            type: 'confirm',
            default: false
          }
        ]);

        Object.assign(context, { typescript });
      }
    },
    async presetConfig(gasket, context) {
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
        ].filter(Boolean)
      }
    },
    async create(gasket, { pkg }) {
      pkg.add('dependencies', dependencies);
    }
  }
}
