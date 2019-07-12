const action = require('../action-wrapper');
const PackageManager = require('../package-manager');

/**
 * Installs node_modules using the selected package manager
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function installModules(context) {
  const manager = new PackageManager(context);

  await manager.install();
}


module.exports = action('Install node modules', installModules);

module.exports.update = action('Update node modules', installModules);
