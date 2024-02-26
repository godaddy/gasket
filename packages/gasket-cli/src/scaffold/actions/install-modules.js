import action from '../action-wrapper.js';

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


export default action('Install node modules', installModules);

export const installModulesUpdate = action('Update node modules', installModules);
