const action = require('../action-wrapper');

/**
 * Installs node_modules using the selected package manager
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function installModules(context) {
  const { pkgManager } = context;

  await pkgManager.install();
}


module.exports = action('Install node modules', installModules);

module.exports.update = action('Update node modules', installModules);
