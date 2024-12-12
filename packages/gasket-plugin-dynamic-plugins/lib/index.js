/// <reference types="@gasket/plugin-metadata" />

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  hooks: {
    async prepare(gasket, config) {
      if (!gasket.config.dynamicPlugins?.length) return config;

      const load = await Promise.all(gasket.config.dynamicPlugins.map(plugin => import(plugin)));
      load.forEach(mod => {
        gasket.config.plugins.push(mod.default);
      });
      gasket.engine.registerPlugins(gasket.config.plugins);
      // eslint-disable-next-line no-sync
      gasket.execApplySync('init', function (plugin, handler) {
        if (gasket.config.dynamicPlugins.includes(plugin.name)) {
          handler();
        }
      });
      // eslint-disable-next-line no-sync
      gasket.execApplySync('configure', async function (plugin, handler) {
        if (gasket.config.dynamicPlugins.includes(plugin.name)) {
          gasket.config = handler(gasket.config);
        }
      });

      return config;
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'dynamicPlugins',
            link: 'README.md#configuration',
            description: 'Specify which plugins to load dynamically into gasket',
            type: 'array'
          }
        ]
      };
    }
  }
};
