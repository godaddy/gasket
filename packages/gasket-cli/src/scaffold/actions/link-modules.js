import action from '../action-wrapper.js';

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

export default action('Link node modules', linkModules, { startSpinner: false });

export const linkModulesUpdate = action('Relink node modules', linkModules, { startSpinner: false });
