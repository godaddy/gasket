const path = require('path');
const { statSync, promises } = require('fs');
const { readdir } = promises;
const defaultsDeep = require('lodash.defaultsdeep');
const { pluginIdentifier } = require('@gasket/resolve');
const defaultPlugins = require('./default-plugins');
const { flattenPresets } = require('../scaffold/utils');
const { applyConfigOverrides } = require('@gasket/utils');

const jsExtension = /\.js$/i;

/**
 * Loads the initial gasket config required for instantiating the PluginEngine.
 *
 * @param {object} flags - CLI Flag
 * @param {string} env - Environment name
 * @param {string} commandId - Name of the command
 * @returns {Promise<object|null>} gasketConfig
 */
async function getGasketConfig(flags, env, commandId) {
  const { root } = flags;

  let gasketConfig = loadConfigFile(flags);
  if (gasketConfig) {
    gasketConfig.root = root;
    gasketConfig.env = env;
    gasketConfig = addDefaultPlugins(gasketConfig);
    gasketConfig = await addUserPlugins(gasketConfig);

    return applyConfigOverrides(gasketConfig, { env, commandId, root, localFile: './gasket.config.local' });
  }
}

/**
 * Returns specified env flag if set or appropriate fallback
 *
 * @param {Object} flags - CLI Flag
 * @param {string} commandId - Name of the command
 * @param {function} warn - Warning logger
 * @returns {string} environment
 */
function getEnvironment(flags, commandId, warn) {
  if (flags.env) return flags.env;

  // special snowflake case to match up `local` env with command unless set
  if (commandId === 'local') {
    return 'local';
  }

  warn('No env specified, falling back to "development".');
  return 'development';
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
    statSync(configFileName); // eslint-disable-line no-sync
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
    const dirPathArray = [
      path.join(gasketConfig.root, 'plugins'),
      path.join(gasketConfig.root, 'src', 'plugins')
    ];
    let moduleNames = [];
    for (let i = 0; i <= dirPathArray.length - 1; i++) {
      try {
        const files = await readdir(dirPathArray[i]);
        const moduleNamesFilter = files
          .filter(fileName => jsExtension.test(fileName))
          .map(fileName => {
            const fileSansExtension = fileName.replace(jsExtension, '');
            return path.join(dirPathArray[i], fileSansExtension);
          });
        await moduleNames.push(moduleNamesFilter);
      } catch (e) {
        await moduleNames.push(gasketConfig.plugins.add || []);
      }
    }

    moduleNames = [].concat(...moduleNames);
    const pluginsConfig = gasketConfig.plugins || {};
    moduleNames = (pluginsConfig.add || []).concat(moduleNames);
    moduleNames = moduleNames.filter((elem, pos) => moduleNames.indexOf(elem) === pos);
    return {
      ...gasketConfig,
      plugins: {
        ...pluginsConfig,
        add: moduleNames
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
  getEnvironment,
  getGasketConfig,
  loadConfigFile,
  addDefaultPlugins,
  addUserPlugins,
  assignPresetConfig
};
