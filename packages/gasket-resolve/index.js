const { pluginIdentifier, presetIdentifier, PackageIdentifier } = require('./package-identifier');

module.exports = {
  Resolver: require('./resolver'),
  plugins: require('./plugins'),
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
};
