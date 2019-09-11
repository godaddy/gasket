const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const { addPluginsToPkg } = require('../utils');
const { presetIdentifier } = require('@gasket/resolve');

/**
 * Initializes the ConfigBuilder builder and adds to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function setupPkg(context) {
  const { appName, appDescription, presetInfos = [], rawPlugins = [], cliVersionRequired } = context;

  const pkg = ConfigBuilder.createPackageJson({
    name: appName,
    version: '0.0.0',
    description: appDescription
  });

  // The preset package itself must be included in the dependencies
  // of the `pkg` to be bootstrapped.
  pkg.add('dependencies', presetInfos.reduce((acc, presetInfo) => {
    // Use rawName in case version or file path was set in cli args
    // Otherwise fallback to resolved version
    const { fullName, version } = presetIdentifier(presetInfo.rawName).withVersion(`^${presetInfo.version}`);

    acc[fullName] = version;
    return acc;
  }, {
    '@gasket/cli': cliVersionRequired
  }));
  addPluginsToPkg(rawPlugins, pkg);

  Object.assign(context, { pkg });
}

module.exports = action('Set up package.json', setupPkg, { startSpinner: false });
