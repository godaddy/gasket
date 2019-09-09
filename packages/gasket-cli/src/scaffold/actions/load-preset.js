const path = require('path');
const action = require('../action-wrapper');
const PackageFetcher = require('../fetcher');
const { presetIdentifier, Loader } = require('@gasket/resolve');

const loader = new Loader();

/**
 * Fetches the preset packages and loads PresetInfos
 *
 * @param {CreateContext} context - Create context
 * @returns {PresetInfo[]} loaded presetInfos
 * @private
 */
async function remotePresets(context) {
  const { cwd, npmconfig, rawPresets = [] } = context;
  return await Promise.all(rawPresets.map(async rawName => {
    const packageName = presetIdentifier(rawName).full;
    const fetcher = new PackageFetcher({ cwd, npmconfig, packageName });
    const pkgPath = await fetcher.clone();
    return loader.loadPreset(pkgPath, { from: 'cli', rawName }, { shallow: true });
  }));
}

/**
 * Loads PresetInfo from local preset package
 *
 * @param {CreateContext} context - Create context
 * @returns {PresetInfo[]} loaded presetInfos
 * @private
 */
function localPreset(context) {
  const { cwd, presetPath } = context;
  const pkgPath = path.resolve(cwd, presetPath);
  const presetInfo = loader.loadPreset(pkgPath, { from: 'cli' }, { shallow: true });
  presetInfo.rawName = `${presetInfo.package.name}@file:${pkgPath}`;

  return [presetInfo];
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

  const presetInfos = presetPath ? localPreset(context) : await remotePresets(context);
  const presets = presetInfos.map(p => presetIdentifier(p.rawName).shortName);

  Object.assign(context, { presets, presetInfos });
}

module.exports = action('Load presets', loadPreset);
