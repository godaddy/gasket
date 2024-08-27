const path = require('path');
const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const isGasketModule = /(@gasket\/|gasket-)(?!plugin)(?!preset).+/;
const isGasketPreset = /(gasket-preset)|(@gasket\/preset-)/;
const isGasketPlugin = /(gasket-plugin)|(@gasket\/plugin-)/;
let _metadata;

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
    // eslint-disable-next-line no-console
    console.error(`Error loading app metadata: ${err.message}`);
  }

  return app;
}

/** @type {import('@gasket/core').ActionHandler<'getMetadata'>} */
async function getMetadata(gasket) {
  if (!_metadata) {
    const app = getAppInfo(gasket);
    const plugins = [];
    const presets = [];
    const modules = {};

    await gasket.execApply('metadata', async (plugin, handler) => {
      const isPreset = isGasketPreset.test(plugin.name);
      const isPlugin = isGasketPlugin.test(plugin.name);
      const isGasketPackage = isPlugin || isPreset;
      const pluginData = {
        ...plugin,
        metadata: (await handler({ name: plugin.name }))
      };

      if (!isGasketPackage) {
        pluginData.metadata.path = path.join(app.path, 'plugins');
        plugins.push(pluginData);
      } else {
        pluginData.metadata.path = path.dirname(path.join(require.resolve(pluginData.name), '..'));
        const { dependencies, devDependencies } = require(path.join(pluginData.metadata.path, 'package.json'));

        if (isPreset)
          presets.push(pluginData);
        else
          plugins.push(pluginData);

        for (const name of Object.keys({ ...dependencies, ...devDependencies })) {
          const isModule = isGasketModule.test(name);
          if (!isModule) continue;
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

    _metadata = { app, plugins, modules: Object.values(modules), presets };
  }

  return _metadata;
}

module.exports = {
  getMetadata
};
