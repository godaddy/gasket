import semver from 'semver';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import getPackageLatestVersion from './get-package-latest-version.js';

// ESM doesn't have __dirname, so we need to construct it
const _dirname = path.dirname(fileURLToPath(import.meta.url));

const cachePath = path.join(_dirname, '..', '.cache'); // Place at root of package
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
 * @returns {Promise<string>} - latest version of the package
 */
async function getLatestVersion(pkgName, currentTime, cache) {
  if (
    !cache[LATEST_VERSION_UPDATE_TIME] ||
    !cache[LATEST_VERSION] ||
    isOlderThanSevenDays(currentTime, cache[LATEST_VERSION_UPDATE_TIME])
  ) {
    try {
      const latestVersion = await getPackageLatestVersion(pkgName, {});
      cache[LATEST_VERSION_UPDATE_TIME] = currentTime;
      cache[LATEST_VERSION] = latestVersion;
      await writeFile(cachePath, JSON.stringify(cache));
      return latestVersion;
    } catch (error) {
      // eslint-disable-next-line no-console
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
export default async function warnIfOutdated(pkgName, currentVersion) {
  const currentTime = new Date().getTime();
  let cache = {};

  try {
    const file = await readFile(cachePath, 'utf8');
    cache = JSON.parse(file);
  } catch {
    // console.error('Error reading cache file:', error);
  }

  const latestVersion = await getLatestVersion(pkgName, currentTime, cache);

  if (typeof latestVersion === 'string' && semver.gt(latestVersion, currentVersion)) {
    // eslint-disable-next-line no-console
    console.warn(
      ` ${chalk.yellow('›')}   ` +
      `Warning: ${pkgName} update available from ${chalk.green(latestVersion)} to ${chalk.green(currentVersion)}`
    );
  }
}
