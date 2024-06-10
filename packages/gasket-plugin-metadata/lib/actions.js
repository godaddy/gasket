const path = require('path');
const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;

function getAppInfo(gasket) {
  const { config: { root } } = gasket;
  const tryPath = isModulePath.test(root) ? path.join(root, 'package.json') : `${root}/package.json`;
  let app;

  try {
    const pkgPath = require.resolve(tryPath, { paths: [root] });
    const pkg = require(pkgPath);
    app = {
      path: path.dirname(pkgPath),
      package: pkg,
      version: pkg.version,
      name: pkg.name
    };
  } catch (err) {
    console.log(`Error loadings app metadata: ${err.message}`);
  }

  return app;
}

module.exports = function actions(gasket) {
  return {
    getMetadata: async function getMetadata() {
      const app = getAppInfo(gasket);
      const plugins = [];
      const modules = [];
      const presets = [];

      await gasket.execApply('metadata', async (data, handler) => {
        const pluginData = await handler(data);
        pluginData.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
        plugins.push(pluginData);

        if (pluginData.modules) {
          pluginData.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
          const data = pluginData.modules.map(m => {
            return { ...m, path: path.dirname(path.join(require.resolve(m.name), '..')) }
          });
          modules.push(...data);
        }
      });

      return { app, plugins, modules, presets };
    }
  }
}
