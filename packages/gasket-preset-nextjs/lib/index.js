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
    async presetConfig(gasket, context) {
      context.nextApp = true;
      return {
        plugins: [
          pluginWebpack,
          pluginExpress,
          pluginHttps,
          pluginNext,
          pluginRedux,
          pluginWinston
        ]
      }
    },
    async create(gasket, { pkg }) {
      pkg.add('dependencies', dependencies);
    }
  }
}
