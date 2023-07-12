const path = require('path');
const { readdir } = require('fs').promises;
const defaultsDeep = require('lodash.defaultsdeep');
const { applyConfigOverrides, tryResolve } = require('@gasket/utils');
const { flattenPresets } = require('./preset-utils');
const jsExtension = /\.(js|cjs)$/i;

const debug = require('diagnostics')('gasket:resolve:config');

async function loadGasketConfigFile(root, env, commandId, configFile = 'gasket.config') {
  let gasketConfig = loadConfigFile(root, configFile);
  if (gasketConfig) {
    gasketConfig.root = root;
    gasketConfig.env = env;
    gasketConfig = await addUserPlugins(gasketConfig);

    return applyConfigOverrides(gasketConfig, { env, commandId, root, localFile: './gasket.config.local' });
  }
}

function loadConfigFile(root, configFile) {
  const absolutePath = !path.isAbsolute(configFile) ? path.join(root, configFile) : configFile;
  const resolvedPath = tryResolve(absolutePath);
  if (resolvedPath) {
    return require(resolvedPath);
  }

  debug(`Failed to resolve Gasket config file ${configFile} from root ${root}`);
}

async function addUserPlugins(gasketConfig) {
  const moduleNames = (await Promise.all([
    resolveUserPlugins(gasketConfig.root, 'plugins'),
    resolveUserPlugins(gasketConfig.root, 'src', 'plugins')
  ])).reduce((acc, cur) => acc.concat(cur), []);

  const pluginsConfig = gasketConfig.plugins || {};
  return {
    ...gasketConfig,
    plugins: {
      ...pluginsConfig,
      add: (pluginsConfig.add || []).concat(moduleNames)
    }
  };
}

/**
 * Resolves a given directory to valid `lifecycle` plugins.
 *
 * @param {string} root - Directory we need to search.
 * @param {string} parts - path parts of the directory that contains the plugins.
 * @returns {string[]} found plugin files
 * @private
 */
async function resolveUserPlugins(root, ...parts) {
  const dir = path.join(root, ...parts);

  let files;
  try {
    files = await readdir(dir);
  } catch (err) {
    // @ts-ignore
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return (files || [])
    .filter(fileName => jsExtension.test(fileName))
    .map(fileName => path.join(dir, fileName));
}

/**
 * Loads config from presets and assigns to the main config.
 *
 * Merge priority order being:
 * - loaded file config > preset configs > child preset configs
 *
 * @param {Gasket} gasket - Gasket engine instance
 */
function assignPresetConfig(gasket) {
  const { presets } = gasket.loader.loadConfigured(gasket.config.plugins);
  // @ts-ignore
  const presetConfigs = flattenPresets(presets).map(p => p.module && p.module.config).filter(Boolean);
  Object.assign(gasket.config, defaultsDeep(gasket.config, ...presetConfigs));
}

module.exports = {
  loadGasketConfigFile,
  assignPresetConfig,
  addUserPlugins
};
