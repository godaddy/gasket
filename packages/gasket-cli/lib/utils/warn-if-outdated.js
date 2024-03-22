const { runShellCommand } = require('@gasket/utils');
const semver = require('semver');
const chalk = require('chalk');

/**
 * Logs a warning message if the package version is outdated
 * @param {string} pkgName - package name
 * @param {string} currentVersion - current version
 */

module.exports = async function warnIfOutdated(pkgName, currentVersion) {
  const cmdResult = await runShellCommand('npm', ['view', pkgName, 'version'], {});

  if (cmdResult?.stdout) {
    const lastestVersion = cmdResult.stdout.trim();
    const isOutdated = semver.gt(lastestVersion, currentVersion);
    if (isOutdated) {
      console.warn(` ${chalk.yellow('›')}   Warning: @gasket/cli update available from ${chalk.green(lastestVersion)} to ${chalk.green(currentVersion)}`);
    }
  }
};
