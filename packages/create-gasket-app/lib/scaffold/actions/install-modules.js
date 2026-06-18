import { withSpinner } from '../with-spinner.js';

/** @type {import('../../internal.d.ts').installModules} */
async function installModules({ context }) {
  const { pkgManager } = context;

  await pkgManager.install();
}

export default withSpinner('Install node modules', installModules);
