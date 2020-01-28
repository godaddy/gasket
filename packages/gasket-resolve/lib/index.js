const { pluginIdentifier, presetIdentifier } = require('./identifiers');
const { projectIdentifier } = require('./package-identifier');

module.exports = {
  Resolver: require('./resolver'),
  Loader: require('./loader'),
  pluginIdentifier,
  presetIdentifier,
  projectIdentifier
};
