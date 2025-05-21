import { withSpinner } from '../with-spinner.js';

/**
 * Installs node_modules using the selected package manager
 * @type {import('../../internal.js').installModules}
 */
async function installModules({ context }) {
  const { pkgManager } = context;

  await pkgManager.install();
}

export default withSpinner('Install node modules', installModules);
