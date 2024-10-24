import action from '../action-wrapper.js';

/**
 * Links local packages using the selected package manager
 * @type {import('../../internal').linkModules}
 */
async function linkModules({ context, spinner }) {
  const { pkgLinks, pkgManager } = context;

  if (pkgLinks && pkgLinks.length) {
    spinner.start();
    await pkgManager.link(pkgLinks);
  }
}

export default action('Link node modules', linkModules, { startSpinner: false });
