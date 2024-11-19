import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  hooks: {
    async prepare(gasket) {
      if (!process.env.GASKET_DYNAMIC) return;

      const load = await Promise.all(gasket.config.dynamicPlugins.map(name => import(name)));
      load.forEach(mod => {
        gasket.config.plugins.push(mod.default);
      });
      gasket.engine.registerPlugins(gasket.config.plugins);

      gasket.execApplySync('init', function(plugin, handler) {
        if(gasket.config.dynamicPlugins.includes(plugin.name)) {
          handler();
        }
      });
      gasket.execApplySync('configure', async function(plugin, handler) {
        if(gasket.config.dynamicPlugins.includes(plugin.name)) {
          gasket.config = handler(gasket.config);
        }
      });
    }
  }
};
