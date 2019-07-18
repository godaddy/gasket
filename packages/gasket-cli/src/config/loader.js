const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const defaultConfig = require('./defaults');

const readDir = promisify(fs.readdir);
const jsExtension = /\.js$/i;

module.exports = async function getGasketConfig(flags) {
  const gasketConfig = loadConfigFile(flags);
  gasketConfig.root = flags.root;
  return await addUserPlugins(gasketConfig);
};

function loadConfigFile(flags) {
  // Config file is any --config provided or the join
  // of `--root/--config`.
  const configFile = !path.isAbsolute(flags.config)
    ? path.join(flags.root, flags.config)
    : flags.config;

  try {
    return Object.assign({}, require(configFile));
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
    console.warn('No gasket.config file was found. Using default configuration.');
    return Object.assign({}, defaultConfig);
  }
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
