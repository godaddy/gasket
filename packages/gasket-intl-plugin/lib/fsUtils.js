const fs = require('fs-extra');
const path = require('path');

class FsUtils {

  /**
   * Check if path is module. It will look for a package.json file.
   *
   * @param {string} targetDir - File path
   * @returns {boolean} result
   */
  async isModule(targetDir) {
    try {
      const stats = await fs.stat(path.join(targetDir, 'package.json'));
      return !!stats;
    } catch (e) {
      return false;
    }
  }

  /**
   * Find all directories under target dir, recursively
   *
   * @param {string} parentDir - Path to parent directory
   * @param {string[]} dirList - List of full paths
   * @returns {string[]} directories - List of full paths
   */
  async getDirectories(parentDir, dirList = []) {
    const files = await fs.readdir(parentDir);
    for (const file of files) {
      const filePath = path.join(parentDir, file);
      if ((await fs.stat(filePath)).isDirectory()) {
        if (await this.isModule(filePath)) {
          dirList.push(filePath);
        } else {
          dirList.concat(await this.getDirectories(path.join(filePath, '/'), dirList));
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
