const action = require('../action-wrapper');

/**
 * Links local packages using the selected package manager
 *
 * @param {CreateContext} context - Create context
 * @param {Spinner} spinner - Spinner
 * @returns {Promise} promise
 */
async function linkModules(context, spinner) {
  const { pkgLinks, pkgManager } = context;

  if (pkgLinks && pkgLinks.length) {
    spinner.start();
    await pkgManager.link(pkgLinks);
  }
}

module.exports = action('Link node modules', linkModules, { startSpinner: false });

module.exports.update = action('Relink node modules', linkModules, { startSpinner: false });
