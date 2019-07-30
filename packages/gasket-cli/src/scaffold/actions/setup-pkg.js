const semver = require('semver');
const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const { addPluginsToPkg } = require('../plugin-utils');
const { presetIdentifier } = require('../package-identifier');
const pkgVersion = `^${require('../../../package.json').version}`;

/**
 * Helper to check if a module version is a file path
 *
 * @param {string} v - Version to check
 * @returns {Boolean} result
 */
const isFile = v => v && v.includes('file:');

/**
 * Initializes the ConfigBuilder builder and adds to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function setupPkg(context) {
  const { appName, appDescription, rawPresets, presetPkgs, rawPlugins = [], warnings } = context;

  //
  // Gather presets with cli dependencies
  //
  const cliPresets = presetPkgs.filter(p => p.dependencies && p.dependencies['@gasket/cli']);

  //
  // Find the minimum cli version required.
  // File paths are always preferred; for integration tests and local development
  //
  const cliVersion = cliPresets.reduce((acc, cur) => {
    const v = cur.dependencies['@gasket/cli'];
    if (isFile(v)) return v;
    if (isFile(acc)) return acc;
    return !acc || semver.gt(semver.coerce(acc), semver.coerce(v)) ? v : acc;
  }, null);

  //
  // Issue warnings if determined cli version does not meet a preset's requirements
  //
  if (!isFile(cliVersion)) {
    cliPresets.forEach(p => {
      const v = p.dependencies['@gasket/cli'];
      if (!semver.satisfies(semver.coerce(v).version, cliVersion)) {
        warnings.push(
          `Installed @gasket/cli@${cliVersion} which does not satisfy ` +
          `version (${v}) required by ${p.name}@${p.version}`
        );
      }
    });
  }

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
    '@gasket/cli': cliVersion || pkgVersion
  }));
  addPluginsToPkg(rawPlugins, pkg);

  Object.assign(context, { pkg });
}

module.exports = action('Set up package.json', setupPkg, { startSpinner: false });
