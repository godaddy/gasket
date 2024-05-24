const runShellCommand = require('./run-shell-command');

/**
 *
 * @param {string} pkgName - package name
 * @param {object} options - options object
 * @returns {Promise<string>} - latest version of the package
 */
module.exports = async function getPackageLatestVersion(pkgName, options = {}) {
  const cmdResult = await runShellCommand('npm', ['view', pkgName, 'version'], options);
  return cmdResult.stdout.trim();
};
