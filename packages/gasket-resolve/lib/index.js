const { pluginIdentifier, presetIdentifier, PackageIdentifier } = require('./package-identifier');

module.exports = {
  Resolver: require('./resolver'),
  Loader: require('./loader'),
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
};
