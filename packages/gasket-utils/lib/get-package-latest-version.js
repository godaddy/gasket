const runShellCommand = require('./run-shell-command');

/**
 * Get the latest version of a package from npm
 * @type {import('@gasket/utils').getPackageLatestVersion}
 */
module.exports = async function getPackageLatestVersion(pkgName, options = {}) {
  const cmdResult = await runShellCommand('npm', ['view', pkgName, 'version'], options);
  return cmdResult.stdout.trim();
};
