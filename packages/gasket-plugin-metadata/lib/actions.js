import path from 'path';
import { fileURLToPath } from 'url';
import { tryImport } from './utils.js';

const isModulePath = /^[/.]|^[a-zA-Z]:\\|node_modules/;
const isGasketModule = /(@gasket\/|gasket-)(?!plugin)(?!preset).+/;
const isGasketPreset = /(gasket-preset)|(@gasket\/preset-)/;
const isGasketPlugin = /(gasket-plugin)|(@gasket\/plugin-)/;
let _metadata;

/**
 *
 * @param gasket
 */
async function getAppInfo(gasket) {
  const { config: { appRoot } } = gasket;
  const root = appRoot || gasket.config.root;
  const tryPath = isModulePath.test(root) ? path.join(root, 'package.json') : `${root}/package.json`;
  let app;

  try {
    const pkgPath = fileURLToPath(import.meta.resolve(tryPath));
    const pkg = await tryImport(pkgPath);
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
    const app = await getAppInfo(gasket);
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

        try {
          pluginData.metadata.path  = fileURLToPath(import.meta.resolve(path.join(gasket.config.root, 'node_modules', pluginData.name)));
        } catch (error) {
          gasket.logger.error(`Error resolving plugin ${pluginData.name}: ${error.message}`);
          return;
        }

        const { dependencies, devDependencies } = await tryImport(path.join(pluginData.metadata.path, 'package.json'));

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
          const modPkg = await tryImport(path.join(gasket.config.root, 'node_modules', name, 'package.json'));
          if (modPkg) {
            modulesMap[name] = {
              name: modPkg.name,
              version: modPkg.version,
              description: modPkg.description,
              metadata: {
                link: 'README.md',
                path: fileURLToPath(import.meta.resolve(path.join(gasket.config.root, 'node_modules', name)))
              }
            };
          }
        }
      }
    });

    //
    // Update module metadata with gasket.metadata from the package.json if set.
    //
    const modules = await Promise.all(Object.values(modulesMap).map(async (modInfo) => {
      const modPkg = await tryImport(path.join(gasket.config.root, 'node_modules', modInfo.name, 'package.json'));
      modInfo.metadata = {
        ...modInfo.metadata,
        ...modPkg?.gasket?.metadata
      };
      return modInfo;
    }));

    _metadata = { app, plugins, modules, presets };
  }

  return _metadata;
}

export default {
  getMetadata
};
