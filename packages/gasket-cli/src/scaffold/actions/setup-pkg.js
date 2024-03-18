const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const { addPluginsToPkg, getPluginsWithVersions } = require('../utils');
const { PackageManager } = require('@gasket/utils');
const { presetIdentifier } = require('@gasket/resolve');

/**
 * Initializes the ConfigBuilder builder and adds to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function setupPkg(context) {
  const { appName, appDescription, presetInfos = [], rawPlugins = [], cliVersionRequired, warnings } = context;

  const pkg = ConfigBuilder.createPackageJson({
    name: appName,
    version: '0.0.0',
    description: appDescription
  }, { warnings });

  // Expand preset dependencies
  pkg.add('dependencies', presetInfos.reduce((acc, presetInfo) => {
    const { package: { dependencies } } = presetInfo;
    Object.assign(acc, dependencies);
    return acc;
  }, {
    '@gasket/cli': cliVersionRequired
  }));

  // Add preset devDependencies
  pkg.add('devDependencies', presetInfos.reduce((acc, presetInfo) => {
    const { package: { devDependencies } } = presetInfo;
    Object.assign(acc, devDependencies);
    return acc;
  }, {}));

  const pkgManager = new PackageManager(context);
  const pluginIds = await getPluginsWithVersions(rawPlugins, pkgManager);
  addPluginsToPkg(pluginIds, pkg);

  // Empty presets array to avoid loading
  // Preset isn't a dependency of the app
  context.presets = [];
  Object.assign(context, { pkg, pkgManager });
}

module.exports = action('Set up package.json', setupPkg, { startSpinner: false });
