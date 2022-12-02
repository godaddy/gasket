const fs = require('fs/promises');
const path = require('path');
const PackageManager = require('./package-manager');
const tryResolve = require('./try-resolve');

/**
 * Determine package manager
 * @param {string} root Gasket root
 * @returns {string} Package manager cmd
 */
async function getPkgManager(root) {
  try {
    await fs.readFile(path.join(root, 'yarn.lock'), 'utf8');
    return 'yarn';
  } catch (err) {
    return 'npm';
  }
}

/**
 * Lazy load package - load devDependency programmatically when needed
 * @param {string} dependency The require'ed dep needed
 * @param {Gasket} gasket Gasket instance
 * @returns {object} module
 */
module.exports = async function lazyLoadPackage(dependency, gasket) {
  const { logger } = gasket;
  const { root } = gasket.config;
  const modulePath = tryResolve(dependency, [root, __dirname]);

  if (modulePath) {
    logger.info(`LazyLoadPackage - Package "${dependency}" already installed`);
    return require(dependency);
  }

  const cmd = await getPkgManager(root);
  const rePackage = /^(@[^/]+\/)?([^/]+)/;
  const pkg = dependency.match(rePackage)[0];

  logger.info(`LazyLoadPackage - installing "${pkg}" with "${cmd}" - save as a devDependency to avoid this`);
  const manager = new PackageManager({ packageManager: cmd, dest: root });
  await manager.exec('install', [pkg]);
  return require(dependency);
};
