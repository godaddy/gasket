import path from 'path';
import { tryRequire } from './utils.js';

const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const isGasketModule = /(@gasket\/|gasket-)(?!plugin)(?!preset).+/;
const isGasketPreset = /(gasket-preset)|(@gasket\/preset-)/;
const isGasketPlugin = /(gasket-plugin)|(@gasket\/plugin-)/;
let _metadata;

/**
 *
 * @param gasket
 */
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
    const modulesMap = {};

    // eslint-disable-next-line max-statements
    await gasket.execApply('metadata', async (plugin, handler) => {
      const isPreset = isGasketPreset.test(plugin.name);
      const isPlugin = isGasketPlugin.test(plugin.name);
      const isGasketPackage = isPlugin || isPreset;
      const pluginData = {
        ...plugin,
        metadata: (await handler({ name: plugin.name }))
      };

      // normalize declared modules
      pluginData.metadata.modules?.forEach((modInfo) => {
        modulesMap[modInfo.name] = modInfo;
      });

      if (!isGasketPackage) {
        pluginData.metadata.path = path.join(app.metadata.path, 'plugins');
        plugins.push(pluginData);
      } else {
        let resolvedPath;
        try {
          resolvedPath = require.resolve(pluginData.name, { paths: [gasket.config.root] });
        } catch (error) {
          gasket.logger.error(`Error resolving plugin ${pluginData.name}: ${error.message}`);
          return;
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
          const modPkg = tryRequire(`${name}/package.json`);
          if (modPkg) {
            modulesMap[name] = {
              name: modPkg.name,
              version: modPkg.version,
              description: modPkg.description,
              metadata: {
                link: 'README.md',
                path: path.dirname(path.join(require.resolve(name), '..'))
              }
            };
          }
        }
      }
    });

    //
    // Update module metadata with gasket.metadata from the package.json if set.
    //
    const modules = Object.values(modulesMap).map((modInfo) => {
      const modPkg = tryRequire(path.join(`${modInfo.name}/package.json`));
      modInfo.metadata = {
        ...modInfo.metadata,
        ...modPkg?.gasket?.metadata
      };
      return modInfo;
    });

    _metadata = { app, plugins, modules, presets };
  }

  return _metadata;
}

export default {
  getMetadata
};
