const fs = require('fs/promises');
const path = require('path');
const PackageManager = require('./package-manager');
const { tryResolve, resolve } = require('./try-resolve');
const rePackage = /^(@[^/]+\/)?([^/]+)/;

/**
 * Determine package manager
 * @private
 * @param {string} root Gasket root
 * @returns {string} Package manager cmd
 */
async function getPkgManager(root) {
  try {
    await fs.readFile(path.join(root, 'yarn.lock'), 'utf8');
    return {
      pkgMananger: 'yarn',
      cmd: 'add',
      flags: ['--dev'],
      logMsg: (pkg) =>
        `requireWithInstall - installing "${pkg}" with "yarn" - saving as a devDependency`
    };
  } catch (err) {
    return {
      pkgMananger: 'npm',
      cmd: 'install',
      flags: ['--no-save', '--force'],
      logMsg: (pkg) =>
        `requireWithInstall - installing "${pkg}" with "npm" - save as a devDependency to avoid this`
    };
  }
}

/**
 * requireWithInstall - load devDependency programmatically when needed
 * @param {string} dependency The require'ed dep needed
 * @param {Gasket} gasket Gasket instance
 * @returns {object} module
 */
async function requireWithInstall(dependency, gasket) {
  const { logger } = gasket;
  const { root } = gasket.config;
  const resolveOptions = { paths: [root] };
  const modulePath = tryResolve(dependency, resolveOptions);

  if (modulePath) return require(modulePath);

  const { pkgMananger, cmd, flags, logMsg } = await getPkgManager(root);
  const pkg = dependency.match(rePackage)[0];

  const manager = new PackageManager({ packageManager: pkgMananger, dest: root });
  logger.info(logMsg(pkg));
  try {
    await manager.exec(cmd, [pkg, ...flags]);
  } catch (err) {
    logger.error(`requireWithInstall - Failed to install "${pkg}" using "${pkgMananger}"`);
    throw err;
  }
  return require(resolve(dependency, resolveOptions));
}

module.exports = requireWithInstall;
