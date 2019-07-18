const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const { addPluginsToPkg } = require('../plugin-utils');
const { presetIdentifier } = require('../package-identifier');

/**
 * Initializes the ConfigBuilder builder and adds to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function setupPkg(context) {
  const { appName, appDescription, rawPresets, presetPkgs, rawPlugins = [] } = context;

  const pkg = ConfigBuilder.createPackageJson({
    name: appName,
    version: '0.0.0',
    description: appDescription
  });

  // The preset package itself must be included in the dependencies
  // of the `pkg` to be bootstrapped.
  pkg.add('dependencies', rawPresets.reduce((acc, rawPreset, i) => {
    const presetPkg = presetPkgs[i];
    const { fullName, version } = presetIdentifier(rawPreset).withVersion(`^${presetPkg.version}`);

    acc[fullName] = version;
    return acc;
  }, {
    // TODO: read this remotely or include it in the preset itself.
    '@gasket/cli': 'latest'
  }));
  addPluginsToPkg(rawPlugins, pkg);

  Object.assign(context, { pkg });
}

module.exports = action('Set up package.json', setupPkg, { startSpinner: false });
