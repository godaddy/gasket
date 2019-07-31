const semver = require('semver');
const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const { addPluginsToPkg } = require('../plugin-utils');
const { presetIdentifier } = require('../package-identifier');
const pkgVersion = require('../../../package.json').version;
const pkgVersionCompatible = `^${pkgVersion}`;
const actionLabel = 'Set up package.json';
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
 * @param {Spinner} spinner - Spinner
 * @returns {Promise} promise
 */
async function setupPkg(context, spinner) {
  const { appName, appDescription, rawPresets, presetPkgs, rawPlugins = [], warnings } = context;

  //
  // Gather presets with cli dependencies
  //
  const cliPresets = presetPkgs.filter(p => p.dependencies && p.dependencies['@gasket/cli']);

  //
  // Find the preset with minimum cli version required.
  // File paths are always preferred; for integration tests and local development
  //
  const minPreset = cliPresets.reduce((acc, cur) => {
    const nextVersion = cur.dependencies['@gasket/cli'];
    const prevVersion = acc && acc.dependencies['@gasket/cli'];
    if (isFile(nextVersion)) return cur;
    if (isFile(prevVersion)) return acc;
    return !acc || semver.gt(semver.coerce(prevVersion), semver.coerce(nextVersion)) ? cur : acc;
  }, null);

  const cliVersion = minPreset && minPreset.dependencies['@gasket/cli'];

  //
  // Issue warnings if determined cli version does not meet a preset's requirements
  //
  if (!isFile(cliVersion)) {
    let hasWarning = false;
    cliPresets.forEach(p => {
      const v = p.dependencies['@gasket/cli'];
      // installed version mismatch
      if (!semver.satisfies(semver.coerce(v).version, cliVersion)) {
        warnings.push(
          `Installed @gasket/cli@${cliVersion} for ${minPreset.name}@${minPreset.version} ` +
          `which does not satisfy version (${v}) ` +
          `required by ${p.name}@${p.version}`
        );
        hasWarning = true;
      }
    });

    //
    // Issue warnings if globally installed version mismatch with app installed
    //
    console.log(pkgVersion, cliVersion, semver.satisfies(pkgVersion, cliVersion));
    if (!semver.satisfies(pkgVersion, cliVersion)) {
      warnings.push(
        `Installed @gasket/cli@${cliVersion} ` +
        `which is not compatible with global version (${pkgVersion}) ` +
        `used to execute \`gasket create\``
      );
      hasWarning = true;
    }

    if (hasWarning) spinner.warn(actionLabel + ' (cli version mismatch)');
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
    '@gasket/cli': cliVersion || pkgVersionCompatible
  }));
  addPluginsToPkg(rawPlugins, pkg);

  Object.assign(context, { pkg });
}

module.exports = action(actionLabel, setupPkg, { startSpinner: false });
