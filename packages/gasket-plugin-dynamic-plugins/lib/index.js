import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/** @type {import('@gasket/core').Preset} */
export default {
  name,
  version,
  hooks: {
    async prepare(gasket) {
      console.log('gasket-plugin-dev-setup prepare');
      if (!process.env.GASKET_DYNAMIC) return;
  
      const load = await Promise.all(gasket.config.dynamicPlugins.map(name => import(name)));
      load.forEach(mod => {
        gasket.config.plugins.push(mod.default);
      });
  
      gasket.engine.registerPlugins(gasket.config.plugins);
      gasket.execSync('init');
      gasket.config = gasket.execWaterfallSync('configure', gasket.config);
    }
  }
};
