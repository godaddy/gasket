const fs = require('fs/promises');
const path = require('path');
const PackageManager = require('./package-manager');
const tryResolve = require('./try-resolve');

/**
 * Determine package manager
 * @param {string} root Gasket root
 * @param {Logger} logger Gasket logger
 * @returns {string} Package manager cmd
 */
async function getPkgManager(root, logger) {
  const yarnLock = await fs.readFile(path.join(root, 'yarn.lock'), 'utf8').catch(() => {
    logger.info('LazyLoadPackage - Installing using npm');
  });

  if (yarnLock) {
    logger.info('LazyLoadPackage - Installing using yarn');
    return 'yarn';
  }

  return 'npm';
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
  const cmd = await getPkgManager(root, logger);
  const pkg = dependency.split('/')[0];
  const modulePath = tryResolve(dependency, [root, __dirname]);

  if (modulePath) {
    logger.info(`LazyLoadPackage - Package "${dependency}" already installed`);
    return require(dependency);
  }

  logger.info(`LazyLoadPackage - Package "${dependency}" not found`);
  logger.warning(`LazyLoadPackage - installing "${pkg}" - save as a devDependency to avoid this`);
  const manager = new PackageManager({ packageManager: cmd, dest: root });
  await manager.exec('install', [pkg]);
  return require(dependency);
};
