const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const defaultsDeep = require('lodash.defaultsdeep');
const { pluginIdentifier } = require('@gasket/resolve');
const defaultPlugins = require('./default-plugins');
const { flattenPresets } = require('../scaffold/utils');

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
  const configFilePath = !path.isAbsolute(config) ? path.join(root, config) : config;
  const configFileName = configFilePath.endsWith('.js') ? configFilePath : configFilePath + '.js';
  // require the file if config file exist, else return null
  try {
    fs.statSync(configFileName); // eslint-disable-line no-sync
  } catch (err) {
    return null;
  }
  return require(configFilePath);
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
  const filteredNames = new Set(
    add.concat(remove).map(p => {
      const name = typeof p === 'string' ? p : p.name;
      return pluginIdentifier(name).fullName;
    })
  );
  const pluginsToAdd = defaultPlugins.filter(p => !filteredNames.has(pluginIdentifier(p.name).fullName));
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
    const pluginsDir = path.join(gasketConfig.root, 'plugins');
    const files = await readDir(pluginsDir);
    const moduleNames = files
      .filter(fileName => jsExtension.test(fileName))
      .map(fileName => {
        const fileSansExtension = fileName.replace(jsExtension, '');
        return path.join(pluginsDir, fileSansExtension);
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

/**
 * Loads config from presets and assigns to the main config.
 * Merge priority order being:
 * - loaded file config > preset configs > child preset configs
 *
 * @param {Gasket} gasket - Gasket engine instance
 */
function assignPresetConfig(gasket) {
  const { presets } = gasket.loader.loadConfigured(gasket.config.plugins);
  const presetConfigs = flattenPresets(presets).map(p => p.module && p.module.config).filter(Boolean);
  Object.assign(gasket.config, defaultsDeep(gasket.config, ...presetConfigs));
}

module.exports = {
  getGasketConfig,
  loadConfigFile,
  addDefaultPlugins,
  addUserPlugins,
  assignPresetConfig
};
