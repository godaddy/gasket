const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { pluginIdentifier } = require('@gasket/resolve');
const { tryRequire } = require('@gasket/utils');
const defaultPlugins = require('./default-plugins');

const readDir = promisify(fs.readdir);
const jsExtension = /\.js$/i;

/**
 * Loads the initial gasket config required for instantiating the PluginEngine.
 *
 * @param {Object} flags - CLI Flag
 * @returns {Promise<Object>} gasketConfig
 */
async function getGasketConfig(flags) {
  let gasketConfig = loadConfigFile(flags);
  if (gasketConfig) {
    gasketConfig.root = flags.root;
    gasketConfig = addDefaultPlugins(gasketConfig);
    return await addUserPlugins(gasketConfig);
  }
}

/**
 * Load the specified config file from flags.
 * Config file is any --config provided or the join of `--root/--config`.
 *
 * @param {Object} flags - CLI Flags
 * @returns {Object | null} gasketConfig
 */
function loadConfigFile(flags) {
  const { root, config } = flags;
  const configFile = !path.isAbsolute(config) ? path.join(root, config) : config;
  return tryRequire(configFile);
}

/**
 * Inject the default plugins into the loaded config
 *
 * @param {Object} gasketConfig - Gasket config
 * @returns {Object} updated config
 */
function addDefaultPlugins(gasketConfig) {
  const pluginsConfig = gasketConfig.plugins || {};
  const { add = [], remove = [] } = pluginsConfig;
  const filtered = add.concat(remove).map(p => pluginIdentifier(p).shortName);
  const pluginsToAdd = defaultPlugins.filter(p => !filtered.includes(p.name));
  return {
    ...gasketConfig,
    plugins: {
      ...pluginsConfig,
      add: (add).concat(pluginsToAdd)
    }
  };
}

/**
 * Finds all plugins from the app's `./plugins` directory and injects in config
 *
 * @param {Object} gasketConfig - Gasket config
 * @returns {Object} updated config
 */
async function addUserPlugins(gasketConfig) {
  try {
    const pluginsDir = path.join(gasketConfig.root, './plugins');
    const files = await readDir(pluginsDir);
    const moduleNames = files
      .filter(fileName => jsExtension.test(fileName))
      .map(fileName => {
        const fileSansExtension = fileName.replace(jsExtension, '');
        return path.join(pluginsDir, `./${fileSansExtension}`);
      });

    const pluginsConfig = gasketConfig.plugins || {};
    return {
      ...gasketConfig,
      plugins: {
        ...pluginsConfig,
        add: (pluginsConfig.add || []).concat(moduleNames)
      }
    };
  } catch (err) {
    return gasketConfig;
  }
}

module.exports = {
  getGasketConfig,
  loadConfigFile,
  addDefaultPlugins,
  addUserPlugins
};
