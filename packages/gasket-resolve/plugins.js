const path = require('path');
const debug = require('diagnostics')('gasket:resolvePlugins');

const pluginName = /@gasket\/([\w-]+)-plugin/;

/**
 * Returns a list of pluginInfo for all `@gasket/*-plugin`
 * packages in `dirname/package.json` taking into account any
 * `dirname/preset.json`.
 * @param  {Object} dirname Target
 * @return {Object[]} Details for plugins in the `packageJson`.
 */
module.exports = function resolvePlugins({ dirname, resolve }) {
  const Resolver = require('./resolver');
  const resolver = new Resolver({ resolve });

  const { name: preset, dependencies } = require(path.join(dirname, 'package.json'));
  debug('lookup', preset, dependencies);

  return Object.entries(dependencies)
    .map(([name, range]) => {
      const match = pluginName.exec(name);
      if (!match) return;

      const [, shortName] = match;
      return resolver.pluginInfoFor({ shortName, range, preset })
    }).filter(Boolean);
}
