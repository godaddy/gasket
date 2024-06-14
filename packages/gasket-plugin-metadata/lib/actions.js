const path = require('path');
const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const isGasketModule = /^@gasket\/(?!plugin)(?!preset).+/;
const isGodaddyModule = /^@godaddy\/gasket-(?!plugin)(?!preset).+/;

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
    console.error(`Error loading app metadata: ${err.message}`);
  }

  return app;
}

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  return {
    getMetadata: async function getMetadata() {
      const app = getAppInfo(gasket);
      const plugins = [];
      const presets = [];
      const modules = {};

      await gasket.execApply('metadata', async (data, handler) => {
        const isPreset = data.name.startsWith('@gasket/preset-') || data.name.startsWith('@godaddy/gasket-preset-');
        const isPlugin = data.name.startsWith('@gasket/plugin-') || data.name.startsWith('@godaddy/gasket-plugin-');
        const isGasketPackage = isGasketModule.test(data.name) || isPlugin || isPreset;

        if (!isGasketPackage) {
          const pluginData = await handler(data);
          pluginData.path = path.join(app.path, 'plugins');
          plugins.push(pluginData);
        } else {
          const pluginData = await handler(data);
          pluginData.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
          const { dependencies, devDependencies } = require(path.join(pluginData.path, 'package.json'));

          if (isPreset)
            presets.push(pluginData);
          else
            plugins.push(pluginData);

          for (const name of Object.keys({ ...dependencies, ...devDependencies })) {
            if (
              !isGasketModule.test(name) ||
              !isGodaddyModule.test(name)
            ) continue;
            const mod = require(path.join(name, 'package.json'));
            modules[name] = {
              name: mod.name,
              version: mod.version,
              description: mod.description,
              link: 'README.md',
              path: path.dirname(path.join(require.resolve(name), '..'))
            };
          }
        }
      });

      return { app, plugins, modules: Object.values(modules), presets };
    }
  };
};
