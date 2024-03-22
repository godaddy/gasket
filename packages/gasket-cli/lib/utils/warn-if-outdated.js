const { runShellCommand } = require('@gasket/utils');
const semver = require('semver');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, '..', '..', '.cache'); // Place at root of gasket-cli
const LATEST_VERSION = 'latestVersion';
const LATEST_VERSION_UPDATE_TIME = 'latestVersionUpdateTime';

/** 
 * Checks if the latest version update time is older than seven days
 * @param {number} currentTime - current time in milliseconds
 * @param {number} latestVersionUpdateTime - latest version update time in milliseconds
 * @returns {boolean} - true if latestVersionUpdateTime is older than seven days
 */
function isOlderThanSevenDays(currentTime, latestVersionUpdateTime) {
  const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000; // Seven days in milliseconds
  const timeDifference = Math.abs(currentTime - latestVersionUpdateTime);
  return timeDifference > sevenDaysInMillis;
}

/**
 * Fetches the latest version of a package from npm
 * @param {string} pkgName - package name
 * @param {number} currentTime - current time in milliseconds
 * @param {object} cache - cache object
 * @returns {string} - latest version of the package
 */
async function getLatestVersion(pkgName, currentTime, cache) {
  if (!cache[LATEST_VERSION_UPDATE_TIME] || !cache[LATEST_VERSION] || isOlderThanSevenDays(currentTime, cache[LATEST_VERSION_UPDATE_TIME])) {
    try {
      const cmdResult = await runShellCommand('npm', ['view', pkgName, 'version'], {});
      if (cmdResult?.stdout) {
        const latestVersion = cmdResult.stdout.trim();
        cache[LATEST_VERSION_UPDATE_TIME] = currentTime;
        cache[LATEST_VERSION] = latestVersion;
        fs.writeFileSync(cachePath, JSON.stringify(cache));
        return latestVersion;
      }
    } catch (error) {
      console.error('Error fetching latest version:', error);
    }
  } else {
    return cache[LATEST_VERSION];
  }
}

/**
 * Warns if the package is outdated
 * @param {string} pkgName - package name
 * @param {string} currentVersion - current version of the package
 */
module.exports = async function warnIfOutdated(pkgName, currentVersion) {
  const currentTime = new Date().getTime();
  let cache = {};

  if (fs.existsSync(cachePath)) {
    try {
      const file = fs.readFileSync(cachePath, 'utf8');
      cache = JSON.parse(file);
    } catch (error) {
      console.error('Error reading cache file:', error);
    }
  }

  const latestVersion = await getLatestVersion(pkgName, currentTime, cache);

  if (semver.gt(latestVersion, currentVersion)) {
    console.warn(` ${chalk.yellow('›')}   Warning: ${pkgName} update available from ${chalk.green(latestVersion)} to ${chalk.green(currentVersion)}`);
  }
};
