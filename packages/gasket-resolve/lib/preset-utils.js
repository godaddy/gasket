/**
 * Takes list of top-level presets required by an app, and flattens out any that
 * they might extend.
 *
 * Presets are ordered by extended depth, with deeper later.
 *
 * @param {PresetInfo[]} presetInfos - Array of preset infos
 * @returns {PresetInfo[]} flattened presetInfos
 */
function flattenPresets(presetInfos = []) {
  const flattened = [[...presetInfos]];

  function flatten(preset, depth = 1) {
    const arr = flattened[depth] = flattened[depth] || [];
    const { presets } = preset;
    if (Array.isArray(presets)) {
      arr.push(...presets);
      presets.forEach(p => flatten(p, depth + 1));
    }
  }
  presetInfos.forEach(p => flatten(p));

  return flattened.reduce((acc, arr) => acc.concat(arr), []);
}

module.exports = {
  flattenPresets
};
