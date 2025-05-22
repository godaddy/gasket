import { withSpinner } from '../with-spinner.js';

/**
 * Links local packages using the selected package manager
 * @type {import('../../internal.js').linkModules}
 */
async function linkModules({ context, spinner }) {
  const { pkgLinks, pkgManager } = context;

  if (pkgLinks && pkgLinks.length) {
    spinner.start();
    await pkgManager.link(pkgLinks);
  }
}

export default withSpinner('Link node modules', linkModules, { startSpinner: false });
