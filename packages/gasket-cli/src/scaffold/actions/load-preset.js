const path = require('path');
const action = require('../action-wrapper');
const PackageFetcher = require('../fetcher');
const { presetIdentifier, Loader } = require('@gasket/resolve');

const loader = new Loader();

/**
 * Fetches the preset packages and loads PresetInfos
 *
 * @param {[String]} rawPresets - Presets names
 * @param {String} cwd - Root path
 * @param {Object} npmconfig - Config
 * @param {String} from from
 * @returns {PresetInfo[]} loaded presetInfos
 * @private
 */
async function remotePresets(rawPresets, cwd, npmconfig, from) {
  if (!rawPresets) { return []; }

  const allRemotePresets = await Promise.all(rawPresets.map(async rawName => {
    const packageName = presetIdentifier(rawName).full;
    const fetcher = new PackageFetcher({ cwd, npmconfig, packageName });
    const pkgPath = await fetcher.clone();

    const presetInfo = loader.loadPreset(pkgPath, { from: from, rawName }, { shallow: true });
    const { name: presetName, dependencies } = presetInfo.package;
    if (!dependencies) {
      return presetInfo;
    }

    const presetDeps = Object.keys(dependencies).filter(k => presetIdentifier.isValidFullName(k));
    const rawPresetsDeps = presetDeps.map(presetDep => `${presetDep}@${dependencies[presetDep]}`);

    const presetInfoDeps = await remotePresets(rawPresetsDeps, cwd, npmconfig, presetName);
    return {
      ...presetInfo,
      presets: presetInfoDeps
    };
  }));

  return allRemotePresets;
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
  const { rawPresets = [], cwd, npmconfig } = context;
  let presetInfos = await remotePresets(rawPresets, cwd, npmconfig, 'cli');
  presetInfos = presetInfos.concat(localPreset(context));

  const presets = presetInfos.map(p => presetIdentifier(p.rawName).shortName);
  Object.assign(context, { presets, presetInfos });
}

module.exports = action('Load presets', loadPreset);
