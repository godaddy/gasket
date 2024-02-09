const fs = require('fs-extra');
const path = require('path');

/**
 * Tuple of package name and path
 * @typedef {[string, string]} SrcPkgDir
 * @private
 */

/**
 * Utility class for file system operations
 */
class FsUtils {

  /**
   * Check if path has package.json file and return the name.
   *
   * @param {string} targetDir - File path
   * @returns {string|undefined} result
   */
  async packageName(targetDir) {
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
   * @returns {SrcPkgDir[]} directories - List of full paths
   */
  async getPackageDirs(parentDir, dirList = []) {
    const files = await fs.readdir(parentDir);
    for (const file of files) {
      const filePath = path.join(parentDir, file);
      if ((await fs.stat(filePath)).isDirectory()) {
        const pkgName = await this.packageName(filePath);
        if (pkgName) {
          dirList.push([pkgName, filePath]);
        } else {
          dirList.concat(await this.getPackageDirs(path.join(filePath, '/'), dirList));
        }
      }
    }
    return dirList;
  }

  /**
     * Saves a json file to disk
     *
     * @param {string} filePath - Path to the target file
     * @param {object} json - JSON to write out
     * @returns {Promise} promise
     */
  async saveJsonFile(filePath, json) {
    return await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');
  }
}

const fsUtils = new FsUtils();

module.exports = fsUtils;
