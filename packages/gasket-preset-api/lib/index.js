import pluginExpress from '@gasket/plugin-express';
import pluginTypescript from '@gasket/plugin-typescript';
import pluginHttps from '@gasket/plugin-https';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginResponseData from '@gasket/plugin-response-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginLint from '@gasket/plugin-lint';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { name, dependencies, devDependencies } = require('../package.json');

export default {
  name,
  hooks: {
    async presetPrompt(gasket, context, { prompt }) {
      context.apiApp = true;
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
      let testPlugin;
      if ('testPlugin' in context) {
        testPlugin = await import(context.testPlugin);
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
          context.typescript ? pluginTypescript : null,
          testPlugin ? testPlugin.default || testPlugin : null
        ].filter(Boolean)
      }
    },
    create(gasket, context) {
      const { pkg, files } = context;
      const __dirname = fileURLToPath(import.meta.url);
      const generatorDir = `${__dirname}/../../generator`;

      pkg.add('dependencies', dependencies);

      if (!context.typescript) {
        files.add(`${generatorDir}/*`);

        pkg.add('devDependencies', devDependencies);

        pkg.add('scripts', {
          start: 'node server.js',
          local: 'GASKET_ENV=local nodemon server.js',
        });
      }
    }
  }
};
