const { pluginIdentifier, presetIdentifier } = require('./identifiers');

module.exports = {
  Resolver: require('./resolver'),
  Loader: require('./loader'),
  pluginIdentifier,
  presetIdentifier
};
