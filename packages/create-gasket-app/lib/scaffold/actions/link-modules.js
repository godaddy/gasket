import { withSpinner } from '../with-spinner.js';

/** @type {import('../../internal.d.ts').linkModules} */
async function linkModules({ context, spinner }) {
  const { pkgLinks, pkgManager } = context;

  if (pkgLinks && pkgLinks.length) {
    spinner.start();
    await pkgManager.link(pkgLinks);
  }
}

export default withSpinner('Link node modules', linkModules, { startSpinner: false });
