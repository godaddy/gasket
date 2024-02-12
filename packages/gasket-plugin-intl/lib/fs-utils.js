const fs = require('fs-extra');
const path = require('path');

/**
 * Tuple of package name and path
 * @typedef {[string, string]} SrcPkgDir
 * @private
 */

/**
 * Check if path has package.json file and return the name.
 *
 * @param {string} targetDir - File path
 * @returns {string|undefined} result
 */
async function packageName(targetDir) {
  try {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
    return pkg.name;
  } catch (e) {
    // skip;
  }
}

/**
 * Find all directories under target dir, recursively
 *
 * @param {string} parentDir - Path to parent directory
 * @param {SrcPkgDir[]} dirList - List of full paths
 * @returns {AsyncGenerator<SrcPkgDir>} source package directories
 */
async function *getPackageDirs(parentDir, dirList = []) {
  const files = await fs.readdir(parentDir);
  for (const file of files) {
    const filePath = path.join(parentDir, file);
    if ((await fs.stat(filePath)).isDirectory()) {
      const pkgName = await packageName(filePath);
      if (pkgName) {
        yield await Promise.resolve([pkgName, filePath]);
      } else {
        for await (const srcPkgDir of getPackageDirs(path.join(filePath, '/'), dirList)) {
          yield await Promise.resolve(srcPkgDir);
        }
      }
    }
  }
}

/**
 * Saves a json file to disk
 *
 * @param {string} filePath - Path to the target file
 * @param {object} json - JSON to write out
 * @returns {Promise} promise
 */
async function saveJsonFile(filePath, json) {
  return await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');
}

module.exports = {
  getPackageDirs,
  packageName,
  saveJsonFile
};
