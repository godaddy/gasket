/// <reference types="@gasket/plugin-log" />

const fs = require('fs/promises');
const path = require('path');
const PackageManager = require('./package-manager');
const { tryResolve, resolve } = require('./try-resolve');
const rePackage = /^(@[^/]+\/)?([^/]+)/;

/**
 * Determine package manager
 * @private
 * @param {string} root Gasket root
 * @returns {Promise<import('./index').PkgManager>} Package manager cmd
 */
async function getPkgManager(root) {
  try {
    await fs.readFile(path.join(root, 'yarn.lock'), 'utf8');
    return {
      pkgManager: 'yarn',
      cmd: 'add',
      flags: ['--dev'],
      logMsg: (pkg) =>
        `requireWithInstall - installing "${pkg}" with "yarn" - saving as a devDependency`
    };
  } catch (err) {
    return {
      pkgManager: 'npm',
      cmd: 'install',
      flags: ['--no-save', '--force'],
      logMsg: (pkg) =>
        `requireWithInstall - installing "${pkg}" with "npm" - save as a devDependency to avoid this`
    };
  }
}

/**
 * installDependency - install dependency
 * @param {string | string[]} dependency The dep/s needed
 * @param {import('@gasket/engine').Gasket} gasket Gasket instance
 */
async function installDependency(dependency, gasket) {
  const { logger } = gasket;
  const { root } = gasket.config;
  const { pkgManager, cmd, flags, logMsg } = await getPkgManager(root);
  const manager = new PackageManager({
    packageManager: pkgManager,
    dest: root
  });

  const msg = Array.isArray(dependency) ? dependency.toString() : dependency;
  const args = Array.isArray(dependency)
    ? [...dependency, ...flags]
    : [dependency, ...flags];

  logger.info(logMsg(msg));
  try {
    await manager.exec(cmd, args);
  } catch (err) {
    logger.error(
      `requireWithInstall - Failed to install "${dependency}" using "${pkgManager}"`
    );
    throw err;
  }
}

/**
 * requireWithInstall - load devDependency request programmatically when needed
 * @param {string|string[]} dependency The require'ed dep/s needed
 * @param {import('@gasket/engine').Gasket} gasket Gasket instance
 * @returns {Promise<string[]>} module or list of modules
 */
// eslint-disable-next-line max-statements
async function requireWithInstall(dependency, gasket) {
  const { root } = gasket.config;
  const resolveOptions = { paths: [root] };
  if (!Array.isArray(dependency)) {
    const modulePath = tryResolve(dependency, resolveOptions);

    if (modulePath) return require(modulePath);

    const pkg = dependency.match(rePackage)[0];

    await installDependency(pkg, gasket);

    return require(resolve(dependency, resolveOptions));
  }

  /** @type {number[]} */
  const idxListToResolve = [];
  /** @type {string[]} */
  const pkgListToResolve = [];
  const resolvedDependencyList = dependency.reduce((all, item, index) => {
    const modulePath = tryResolve(item, resolveOptions);

    if (modulePath) {
      all.push(require(modulePath));
    } else {
      const pkg = item.match(rePackage)[0];
      all.push(null);
      idxListToResolve.push(index);
      pkgListToResolve.push(pkg);
    }
    return all;
  }, []);

  if (!idxListToResolve.length) {
    return resolvedDependencyList;
  }

  await installDependency(pkgListToResolve, gasket);

  for (const idx of idxListToResolve) {
    const resolvedDep = require(resolve(dependency[idx], resolveOptions));
    resolvedDependencyList[idx] = resolvedDep;
  }

  return resolvedDependencyList;
}

module.exports = requireWithInstall;
