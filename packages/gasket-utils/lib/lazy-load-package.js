const fs = require('fs/promises');
const path = require('path');
const PackageManager = require('./package-manager');

/**
 * Determine package manager
 * @param {string} root Gasket root
 * @param {Logger} logger Gasket logger
 * @returns {string} Package manager cmd
 */
async function getPkgManager(root, logger) {
  const yarnLock = await fs.readFile(path.join(root, 'yarn.lock'), 'utf8').catch(err => {
    logger.info('Installing using npm');
  });

  if (yarnLock) {
    logger.info('Installing using yarn');
    return 'yarn';
  }

  return 'npm';
}

/**
 * Lazy load package - load devDependency programmatically when needed
 * @param {string} dependency The require'ed dep needed
 * @param {Gasket} args.gasket Gasket instance
 * @param {boolean} args.saveDev Flag to save package as an app-level devDependency
 * @returns
 */
module.exports = async function lazyLoadPackage(dependency, { gasket, saveDev = false }) {
  const { logger } = gasket;
  const { root } = gasket.config;
  const cmd = await getPkgManager(root, logger);
  const package = dependency.split('/')[0];
  const { devDependencies } = gasket.metadata.app.package;
  const isDevDep = !!devDependencies[package];
  const flag = saveDev ? '-D' : '--no-save';

  try {
    require(require.resolve(`${dependency}`, { paths: [root, __dirname] }));
    logger.info(`Package ${dependency} already installed`);
    if (isDevDep === saveDev) return require(dependency);
  } catch (err) {
    logger.info(`Package ${dependency} is not installed`);
  }

  if (!saveDev) logger.warning('Package not saved to devDependencies');
  else logger.info(`Saved ${package} devDependencies`);

  logger.info(`Installing package - ${package}...`);
  const manager = new PackageManager({ packageManager: cmd, dest: root });
  await manager.exec('install', [package, flag]);
  return require(dependency);
}
