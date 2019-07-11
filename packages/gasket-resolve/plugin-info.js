/**
 * Returns the standard `PluginInfo` representation of the
 * given opts
 * @param  {String} options.shortName e.g. 'core' for '@gasket/core-plugin'
 * @param  {String} options.range     Semver range required
 * @param  {String} options.preset    Preset that resolved this PluginInfo
 * @param  {Object} options.required  Result of plugin resolution (`module.exports`).
 * @returns {PluginInfo} Standard plugin format for all gasket purposes.
 */
module.exports = function pluginInfoFor({ shortName, range, preset, required, config }) {
  return {
    required: required,
    kind: 'plugin',
    from: preset,
    shortName,
    name: `@gasket/${shortName}-plugin`,
    range,
    // TODO: Load an optional dirname/preset.json if it exists
    config: config || {}
  };
};
