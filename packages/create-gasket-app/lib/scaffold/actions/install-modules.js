import action from '../action-wrapper.js';

/**
 * Installs node_modules using the selected package manager
 *
 * @type {import('../../internal').installModules}
 */
async function installModules({ context }) {
  const { pkgManager } = context;

  await pkgManager.install();
}

export default action('Install node modules', installModules);
