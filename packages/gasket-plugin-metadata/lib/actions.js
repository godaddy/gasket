const path = require('path');
const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const isGasketModule = /(@gasket\/|gasket-)(?!plugin)(?!preset).+/;
const isGasketPreset = /(gasket-preset)|(@gasket\/preset-)/;
const isGasketPlugin = /(gasket-plugin)|(@gasket\/plugin-)/;
let _metadata;

function tryRequire(path) {
  try {
    return require(path);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

function getAppInfo(gasket) {
  const { config: { root } } = gasket;
  const tryPath = isModulePath.test(root) ? path.join(root, 'package.json') : `${root}/package.json`;
  let app;

  try {
    const pkgPath = require.resolve(tryPath, { paths: [root] });
    const pkg = require(pkgPath);
    app = {
      package: pkg,
      version: pkg.version,
      name: pkg.name,
      metadata: {
        name: pkg.name,
        path: path.dirname(pkgPath)
      }
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

    // eslint-disable-next-line max-statements
    await gasket.execApply('metadata', async (plugin, handler) => {
      const isPreset = isGasketPreset.test(plugin.name);
      const isPlugin = isGasketPlugin.test(plugin.name);
      const isGasketPackage = isPlugin || isPreset;
      const pluginData = {
        ...plugin,
        metadata: (await handler({ name: plugin.name }))
      };

      if (!isGasketPackage) {
        pluginData.metadata.path = path.join(app.metadata.path, 'plugins');
        plugins.push(pluginData);
      } else {
        let resolvedPath;
        try {
          resolvedPath = require.resolve(pluginData.name, { paths: [gasket.config.root] });
        } catch (err) {
          // try esm import
          try {
            resolvedPath = await import(pluginData.name);
          // eslint-disable-next-line no-catch-shadow, no-shadow
          } catch (err) {
            gasket.logger.error(`Error resolving plugin ${pluginData.name}: ${err.message}`);
            return;
          }
        }
        pluginData.metadata.path = path.dirname(path.join(resolvedPath, '..'));
        const { dependencies, devDependencies } = require(path.join(pluginData.metadata.path, 'package.json'));

        if (isPreset) {
          presets.push(pluginData);
        } else {
          plugins.push(pluginData);
        }

        for (const name of Object.keys({ ...dependencies, ...devDependencies })) {
          const isModule = isGasketModule.test(name);
          // eslint-disable-next-line no-continue
          if (!isModule) continue;

          //
          // get gasket module details if installed
          //
          const mod = tryRequire(path.join(name, 'package.json'));
          if (mod) {
            modules[name] = {
              name: mod.name,
              version: mod.version,
              description: mod.description,
              metadata: {
                link: 'README.md',
                path: path.dirname(path.join(require.resolve(name), '..'))
              }
            };
          }
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
