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
    logger.info('Yarn not found - Falling back to NPM');
  });

  if (yarnLock) {
    logger.info('Yarn package manager found');
    return 'yarn';
  }

  return 'npm';
}

/**
 * Check package for path traversals - infers a CLI package
 * @param {string} package The passed package name
 * @returns {object} Package descriptor
 */
function checkPackage(package) {
  const pkgPaths = package.split('/');
  return {
    package: pkgPaths[0],
    path: pkgPaths.slice(1).join('')
  };
}

/**
 * Check if package is a devDependency
 * @param {string} root Gasket root
 * @param {string} package The passed package name
 * @returns {boolean} If package is a devDependency
 */
function checkDevDependencies(root, package) {
  const { devDependencies } = require(path.join(root, 'package.json'));
  return !!devDependencies[package];
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
  const { package, path } = checkPackage(dependency);
  const isDevDep = checkDevDependencies(root, package);
  const dep = path ? `${package}/${path}` : package;
  const flag = saveDev ? '-D' : '--no-save';

  try {
    require(require.resolve(`${dep}`, { paths: [root, __dirname] }));
    logger.info(`Package ${dep} already installed`);
    if (isDevDep === saveDev) return require(dep);
  } catch (err) {
    logger.info(`Package ${dep} is not installed`);
  }

  if (!saveDev) logger.warning('Package not saved to devDependencies');
  else logger.info(`Saved ${package} devDependencies`);

  logger.info(`Installing package - ${package}...`);
  const manager = new PackageManager({ packageManager: cmd, dest: root });
  await manager.exec('install', [package, flag]);
  return require(dep);
}
