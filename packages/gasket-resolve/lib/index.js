const { Resolver } = require('./resolver');
const { Loader } = require('./loader');
const { pluginIdentifier, presetIdentifier } = require('./identifiers');
const { projectIdentifier } = require('./package-identifier');
const { loadGasketConfigDefinition, assignPresetConfig } = require('./config');
const { flattenPresets } = require('./preset-utils');

module.exports = {
  Resolver,
  Loader,
  pluginIdentifier,
  presetIdentifier,
  projectIdentifier,
  loadGasketConfigDefinition,
  assignPresetConfig,
  flattenPresets
};
