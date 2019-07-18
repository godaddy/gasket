const { pluginIdentifier } = require('./package-identifier');

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
 * @param {PluginDesc[]} plugins - Plugins names
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

module.exports = {
  addPluginsToContext,
  addPluginsToPkg
};
