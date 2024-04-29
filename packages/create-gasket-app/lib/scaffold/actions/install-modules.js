import action from '../action-wrapper.js';

/**
 * Installs node_modules using the selected package manager
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function installModules(gasket, context) {
  const { pkgManager } = context;

  await pkgManager.install();
}

export default action('Install node modules', installModules);
