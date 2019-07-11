const path = require('path');
const debug = require('diagnostics')('gasket:resolvePlugins');
const semver = require('semver');

const pluginName = /@gasket\/([\w-]+)-plugin/;

/**
 * Format plugin information for uniform error messages
 * @param {Plugin} plugin gasket plugin
 */
function pluginString(plugin) {
  return `${plugin.name}@${plugin.range}`;
}

/**
 * Given a list of plugins, return a subset of plugins that has been deduped
 * via semver. If ranges mismatch, an error will be thrown.
 *
 * @param {Array<Plugin>} plugins Details for plugins
 */
function resolveViaSemver(plugins) {
  const merged = {};

  plugins.forEach(function thingy(plugin) {
    if (!merged[plugin.name]) {
      merged[plugin.name] = plugin;
      return;
    }

    const duplicatePlugin = merged[plugin.name];

    if (!semver.satisfies(semver.minVersion(plugin.range), duplicatePlugin.range)) {
      throw new Error(`${plugin.from} uses ${pluginString(plugin)}, which is currently depended upon by ${pluginString(duplicatePlugin)}`);
    }
  });

  return Object.values(merged);
}

/**
 * Returns a list of pluginInfo for all `@gasket/*-plugin`
 * packages in `dirname/package.json` taking into account any
 * `dirname/preset.json`.
 * @param  {Object} dirname Target
 * @param  {Function} resolve how to resolve modules relative to the right directory
 * @param  {Object[]} [extends] what presets are being extended.
 * @return {Object[]} Details for plugins in the `packageJson`.
 */
module.exports = function resolvePlugins({ dirname, resolve, extends: extendedPresets = [] }) {
  const Resolver = require('./resolver');
  const resolver = new Resolver({ resolve });

  let extendsFrom = extendedPresets.map(ext => {
    if (Array.isArray(ext)) return ext;
    if (typeof ext === 'string') return resolve(ext);

    throw new Error('Unexpected extending preset: ', ext);
  });

  // flatten the `extendsFrom` into a single array
  extendsFrom = [].concat.apply([], extendsFrom);

  const { name: preset, dependencies } = require(path.join(dirname, 'package.json'));
  debug('lookup', preset, dependencies);

  const topLevel = Object.entries(dependencies)
    .map(([name, range]) => {
      const match = pluginName.exec(name);
      if (!match) return;

      const [, shortName] = match;
      return resolver.pluginInfoFor({ shortName, range, preset })
    }).filter(Boolean);

  return resolveViaSemver(topLevel.concat(extendsFrom));
}
