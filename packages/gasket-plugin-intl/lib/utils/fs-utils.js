const fs = require('fs-extra');
const path = require('path');

/**
 * Check if path has package.json file and return the name.
 * @param {string} targetDir - File path
 * @returns {Promise<string|undefined>} result
 */
async function packageName(targetDir) {
  try {
    const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
    return pkg.name;
  } catch {
    // skip;
  }
}

/**
 * Find all directories under target dir, recursively
 * @type {import('../internal').getPackageDirs}
 */
async function *getPackageDirs(parentDir, dirList = []) {
  const files = await fs.readdir(parentDir);
  for (const file of files) {
    const filePath = path.join(parentDir, file);
    if ((await fs.stat(filePath)).isDirectory()) {
      const pkgName = await packageName(filePath);
      if (pkgName) {
        yield [pkgName, filePath];
      } else {
        yield* getPackageDirs(path.join(filePath, '/'), dirList);
      }
    }
  }
}

/**
 * Saves a json file to disk
 * @param {string} filePath - Path to the target file
 * @param {JSON} json - JSON to write out
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
