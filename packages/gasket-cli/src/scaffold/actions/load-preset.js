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
  if (!rawPresets) { return []; }

  const allRemotePresets = await Promise.all(rawPresets.map(rawName => {
    return remoteInnerPresets(rawName, cwd, npmconfig);
  }));
  return allRemotePresets.reduce((acc, values) => acc.concat(values), []);
}

/**
 * Fetches the preset packages and loads PresetInfos recursively
 *
 * @param {String} rawName - Preset name
 * @param {String} cwd - Root path
 * @param {Object} npmconfig - Config
 * @returns {PresetInfo[]} loaded presetInfos
 * @private
 */
async function remoteInnerPresets(rawName, cwd, npmconfig) {
  const packageName = presetIdentifier(rawName).full;
  const fetcher = new PackageFetcher({ cwd, npmconfig, packageName });
  const pkgPath = await fetcher.clone();

  const presetInfos = [loader.loadPreset(pkgPath, { from: 'cli', rawName }, { shallow: true })];

  const presets = loader.presetDependencies(pkgPath, { from: 'cli', rawName });
  const presetDepInfos = await Promise.all(presets.map(async presetName => {
    return await remoteInnerPresets(presetName, cwd, npmconfig);
  }));

  const presetDepInfosFlat = presetDepInfos.reduce((acc, values) => acc.concat(values), []);
  return presetInfos.concat(presetDepInfosFlat);
}

/**
 * Loads PresetInfo from local preset package
 *
 * @param {CreateContext} context - Create context
 * @returns {PresetInfo[]} loaded presetInfos
 * @private
 */
function localPreset(context) {
  const { cwd, localPresets = [] } = context;
  if (!localPresets) { return []; }

  const presetInfos = [];
  localPresets.forEach(localPresetPath => {
    const pkgPath = path.resolve(cwd, localPresetPath);
    const presetInfo = loader.loadPreset(pkgPath, { from: 'cli' }, { shallow: false });
    presetInfo.rawName = `${presetInfo.package.name}@file:${pkgPath}`;
    presetInfos.push(presetInfo);
  });

  return presetInfos;
}

/**
 * Downloads the target preset package and adds the package.json
 * contents and plugins dependencies to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function loadPreset(context) {
  let presetInfos = await remotePresets(context);
  presetInfos = presetInfos.concat(localPreset(context));

  const presets = presetInfos.map(p => presetIdentifier(p.rawName).shortName);
  Object.assign(context, { presets, presetInfos });
}

module.exports = action('Load presets', loadPreset);
