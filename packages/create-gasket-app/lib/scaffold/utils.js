const path = require('path');
const untildify = require('untildify');
const { pluginIdentifier } = require('@gasket/resolve');

/**
 * Pushes plugins short names for use in gasket.config.js
 * Pushes the original plugin identifiers under rawPlugins
 *
 * @param {PluginDesc[]} plugins - Plugins names
 * @param {CreateContext} context - Create context
 */
function addPluginsToContext(plugins, context) {
  context.rawPlugins = context.rawPlugins || [];
  context.plugins = context.plugins || [];

  context.rawPlugins = plugins.reduce((acc, cur) => {
    const next = pluginIdentifier(cur);

    // get the index of existing plugins by comparing short names
    const idx = acc.map(p => pluginIdentifier(p).shortName).indexOf(next.shortName);

    if (idx > -1) {
      // if the existing plugin does not specify a version, use the next one
      if (!pluginIdentifier(acc[idx]).version) {
        acc[idx] = cur;
      }
    } else {
      // if we don't already have an entry, push the next one
      acc.push(cur);
    }

    return acc;
  }, context.rawPlugins);

  context.plugins = plugins.reduce((acc, cur) => {
    const next = pluginIdentifier(cur).shortName;
    if (!acc.includes(next)) acc.push(next);
    return acc;
  }, context.plugins);
}

/**
 * Adds plugins and dependencies of the app package
 *
 * @param {PluginDesc[]|pluginIdentifier[]} plugins - Plugins names
 * @param {PackageJson} pkg - Package builder
 * @param {String} [field] - Dependency type (Default: dependencies)
 */
function addPluginsToPkg(plugins, pkg, field = 'dependencies') {
  const pluginIds = plugins.map(p => pluginIdentifier(p).withVersion());
  pkg.add(field, pluginIds.reduce((acc, p) => {
    if (!acc[p.fullName]) {
      acc[p.fullName] = p.version;
    }
    return acc;
  }, {}));
}

/**
 * Look up registry version of provided plugin descriptions w/o versions set.
 *
 * @param {PluginDesc[]|pluginIdentifier[]} plugins - Plugins names
 * @param {PackageManager} pkgManager - Package manager instance
 * @returns {Promise<pluginIdentifier[]>} plugins
 */
async function getPluginsWithVersions(plugins, pkgManager) {
  return await Promise.all(
    plugins.map(async name => {
      const id = pluginIdentifier(name);
      if (id.version != null) return id;
      const version = (await pkgManager.info([id.fullName, 'version'])).data;
      return id.withVersion(`^${version}`);
    })
  );
}

/**
 * Takes a file path and transforms it to be absolute if not already
 *
 * @param {string} filepath - Path to file that may be relative or have tildy
 * @returns {string} absolute filepath
 */
function ensureAbsolute(filepath) {
  filepath = untildify(filepath);
  if (path.isAbsolute(filepath)) return filepath;
  return path.resolve(process.cwd(), filepath);
}


/**
 * Parses JSON file or string to assign to context
 *
 * @param {CreateContext} context - Create context.
 * @param {Object} configFlags - flags to read config from
 * @param {string} configFlags.config - JSON string of config values
 * @param {string} configFlags.configFile - path to JSON file of config values
 */
function readConfig(context, { config, configFile }) {
  if (config) {
    const parsedConfig = JSON.parse(config);
    Object.assign(context, parsedConfig);
  } else if (configFile) {
    const parsedConfigFile = require(path.resolve(context.cwd, configFile));
    Object.assign(context, parsedConfigFile);
  }
}


module.exports = {
  addPluginsToContext,
  addPluginsToPkg,
  getPluginsWithVersions,
  ensureAbsolute,
  readConfig
};
