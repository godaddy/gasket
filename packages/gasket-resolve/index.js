const { pluginIdentifier, presetIdentifier, PackageIdentifier } = require('./package-identifier');

module.exports = {
  Resolver: require('./resolver'),
  Loader: require('./loader'),
  plugins: require('./plugins'),
  pluginIdentifier,
  presetIdentifier,
  PackageIdentifier
};
