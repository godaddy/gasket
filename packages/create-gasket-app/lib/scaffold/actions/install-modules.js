import { withSpinner } from '../with-spinner.js';

/**
 * Installs node_modules using the selected package manager
 * @type {import('../../internal').installModules}
 */
async function installModules({ context }) {
  const { pkgManager } = context;

  await pkgManager.install();
}

export default withSpinner('Install node modules', installModules);
