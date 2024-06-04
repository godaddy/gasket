const path = require('path');
const { stat, mkdir } = require('fs').promises;

/**
 * createDir - Create a directory if it doesn't exist
 * @param {string} targetRoot Path of the new directory
 * @param {string} dir Name of the new directory
 */
module.exports = async function createDir(targetRoot, dir) {
  const tpath = path.join(targetRoot, dir);
  try {
    await stat(tpath);
  } catch (err) {
    await mkdir(tpath, { recursive: true });
  }
};
