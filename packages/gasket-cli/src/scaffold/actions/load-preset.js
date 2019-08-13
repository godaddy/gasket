const path = require('path');
const action = require('../action-wrapper');
const PackageFetcher = require('../fetcher');
const { pluginIdentifier, presetIdentifier } = require('@gasket/resolve');

/**
 * Fetches the preset package and reads package.json contents
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise<[Array]>} results
 * @private
 */
async function remotePresets(context) {
  const { cwd, npmconfig, rawPresets = [] } = context;
  const presetPkgs = await Promise.all(rawPresets.map(rawPreset => {
    const packageName = presetIdentifier(rawPreset).full;
    const fetcher = new PackageFetcher({ cwd, npmconfig, packageName });

    return fetcher.readPackage();
  }));

  return [rawPresets, presetPkgs];
}

/**
 * Reads package.json contents from local preset package
 *
 * @param {CreateContext} context - Create context
 * @returns {Array} results
 * @private
 */
function localPreset(context) {
  const { cwd, presetPath } = context;
  const pkgPath = path.resolve(cwd, presetPath);
  const presetPkg = require(path.join(pkgPath, 'package.json'));
  const rawPreset = `${presetPkg.name}@file:${pkgPath}`;

  return [[rawPreset], [presetPkg]];
}

/**
 * Downloads the target preset package and adds the package.json
 * contents and plugins dependencies to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function loadPreset(context) {
  const { presetPath } = context;

  const [rawPresets, presetPkgs] = presetPath
    ? localPreset(context)
    : await remotePresets(context);

  const { presets, presetPlugins, fullPresets } = rawPresets.reduce((acc, rawPreset, i) => {
    const presetPkg = presetPkgs[i];
    const preset = presetIdentifier(rawPreset).withVersion(`${presetPkg.version}`);

    acc.presets.push(preset.shortName);
    acc.fullPresets.push(`${preset.full}`);

    //
    // Gather all plugins dependencies of preset, using short name
    //
    Object.keys(presetPkg.dependencies)
      .filter(pkg => pkg.endsWith('-plugin'))
      .forEach(pkg => acc.presetPlugins.push(pluginIdentifier(pkg).shortName));

    return acc;
  }, {
    presetPlugins: [],
    presets: [],
    fullPresets: []
  });

  Object.assign(context, { presets, presetPlugins, rawPresets, presetPkgs, fullPresets });
}

module.exports = action('Load presets', loadPreset);
