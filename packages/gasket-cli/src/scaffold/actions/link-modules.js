const action = require('../action-wrapper');
const PackageManager = require('../package-manager');

/**
 * Links local packages using the selected package manager
 *
 * @param {CreateContext} context - Create context
 * @param {Spinner} spinner - Spinner
 * @returns {Promise} promise
 */
async function linkModules(context, spinner) {
  const { pkgLinks } = context;

  if (pkgLinks && pkgLinks.length) {
    spinner.start();
    const manager = new PackageManager(context);
    await manager.link(pkgLinks);
  }
}

module.exports = action('Link node modules', linkModules, { startSpinner: false });

module.exports.update = action('Relink node modules', linkModules, { startSpinner: false });
