/**
 * File system utilities.
 */

import fs from 'fs';

/**
 * Recursively remove a directory.
 * @param {string} dirPath - Path to directory
 * @param {object} [opts] - Options
 * @param {function} [opts.log] - Logging function
 * @returns {boolean} True if removed successfully
 */
export function rmRecursive(dirPath, opts = {}) {
  const log = opts.log ?? (() => {});
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    log(`🗑️  Removed ${dirPath}`);
    return true;
  } catch (error) {
    log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
    return false;
  }
}

/**
 * Remove a single file.
 * @param {string} filePath - Path to file
 * @param {object} [opts] - Options
 * @param {function} [opts.log] - Logging function
 * @returns {boolean} True if removed successfully
 */
export function rmFile(filePath, opts = {}) {
  const log = opts.log ?? (() => {});
  try {
    fs.unlinkSync(filePath);
    log(`🗑️  Removed ${filePath}`);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      log(`⚠️  Could not remove ${filePath}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Read and parse a JSON file.
 * @param {string} filePath - Path to JSON file
 * @returns {object|null} Parsed object or null on error
 */
export function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write an object as JSON with trailing newline.
 * @param {string} filePath - Path to write
 * @param {object} data - Data to write
 */
export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
