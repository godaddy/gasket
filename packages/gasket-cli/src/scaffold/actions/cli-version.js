const semver = require('semver');
const { flattenPresets } = require('@gasket/resolve');
const action = require('../action-wrapper');
const pkgVersion = require('../../../package.json').version;
const pkgVersionCompatible = `^${pkgVersion}`;

/**
 * Helper to check if a module version is a file path
 *
 * @param {string} v - Version to check
 * @returns {Boolean} result
 */
const isFile = v => v && v.includes('file:');

/**
 * Determines the active cli version, and the version required to be installed for app.
 *
 * @param {CreateContext} context - Create context
 * @param {Spinner} spinner - Spinner
 */
function resolveCliVersion(context, spinner) {
  const { presetInfos, warnings } = context;

  //
  // Gather presets with cli dependencies
  //
  const cliPresets = flattenPresets(presetInfos)
    .map(p => p.package)
    .filter(p => p.dependencies && p.dependencies['@gasket/cli']);

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

  const requiredVersion = minPreset && minPreset.dependencies['@gasket/cli'];

  //
  // Issue warnings if determined cli version does not meet a preset's requirements
  //
  if (requiredVersion && !isFile(requiredVersion)) {
    let hasWarning = false;
    cliPresets.forEach(p => {
      const v = p.dependencies['@gasket/cli'];
      // installed version mismatch
      if (!semver.satisfies(semver.coerce(v).version, requiredVersion)) {
        warnings.push(
          `Installed @gasket/cli@${requiredVersion} for ${minPreset.name}@${minPreset.version} ` +
          `which does not satisfy version (${v}) ` +
          `required by ${p.name}@${p.version}`
        );
        hasWarning = true;
      }
    });

    //
    // Issue warnings if globally installed version mismatch with app installed
    //
    if (!semver.satisfies(pkgVersion, requiredVersion)) {
      warnings.push(
        `Installed @gasket/cli@${requiredVersion} ` +
        `which is not compatible with global version (${pkgVersion}) ` +
        `used to execute \`gasket create\``
      );
      hasWarning = true;
    }

    if (hasWarning) spinner.warn('CLI version mismatch');
  }

  Object.assign(context, {
    cliVersion: pkgVersion,
    cliVersionRequired: requiredVersion || pkgVersionCompatible
  });
}

module.exports = action('Resolve CLI versions', resolveCliVersion, { startSpinner: false });
