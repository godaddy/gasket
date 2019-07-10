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
module.exports = function resolvePlugins({ dirname, resolve, extends }) {
  const Resolver = require('./resolver');
  const resolver = new Resolver({ resolve });

  const extendsFrom = extends.map(ext => {
    if (Array.isArray(ext)) return ext;
    if (typeof ext === 'string') return resolve(ext);

    throw new Error('Unexpected extends value: ', ext);
  });

  // 1. Flatten array
  // 2. Set merge with Object.entries resolution below
  // 3. **IMPORTANT** ensure that for the data structure
  //    below the following remain true:
  //    - range does not conflict
  //    - from is additive (i.e. ['@gasket/a-preset'])
  //
  //    { required: { name: 'lint', hooks: [Object] },
  //      kind: 'plugin',
  //      from: '@gasket/default-preset',
  //      shortName: 'lint',
  //      name: '@gasket/lint-plugin',
  //      range: '^1.2.0',
  //      config: {} },

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
