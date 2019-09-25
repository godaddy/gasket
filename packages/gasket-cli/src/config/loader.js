const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const defaultConfig = require('./defaults');
const defaultPlugins = require('./default-plugins');

const readDir = promisify(fs.readdir);
const jsExtension = /\.js$/i;

/**
 * Loads the initial gasket config required for instantiating the PluginEngine.
 *
 * @param {Object} flags - CLI Flag
 * @returns {Promise<Object>} gasketConfig
 */
module.exports = async function getGasketConfig(flags) {
  let gasketConfig;
  try {
    gasketConfig = loadConfigFile(flags);
    gasketConfig = addDefaultPlugins(gasketConfig);
    gasketConfig = await addUserPlugins(gasketConfig);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
    console.warn('No gasket.config file was found. Using default configuration.');
    gasketConfig = Object.assign({}, defaultConfig);
  }
  gasketConfig.root = flags.root;
  gasketConfig.flags = flags;
  return gasketConfig;
};

function loadConfigFile(flags) {
  // Config file is any --config provided or the join
  // of `--root/--config`.
  const configFile = !path.isAbsolute(flags.config)
    ? path.join(flags.root, flags.config)
    : flags.config;

  return Object.assign({}, require(configFile));
}

function addDefaultPlugins(gasketConfig) {
  const pluginsConfig = gasketConfig.plugins || defaultConfig.plugins;
  return {
    ...gasketConfig,
    plugins: {
      ...pluginsConfig,
      add: (pluginsConfig.add || []).concat(defaultPlugins)
    }
  };
}

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

    const pluginsConfig = gasketConfig.plugins || defaultConfig.plugins;
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
