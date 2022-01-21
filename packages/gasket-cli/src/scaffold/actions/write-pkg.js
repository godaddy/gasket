const path = require('path');
const { writeFile } = require('fs').promises;
const action = require('../action-wrapper');

/**
 * Writes the contents of `pkg` to the app's package.json.
 *
 * @param {CreateContext} context - Create context
 * @param {Boolean} update - Is an update step
 * @returns {Promise} promise
 */
async function writePkg(context) {
  const { dest, pkg, generatedFiles } = context;
  const fileName = 'package.json';
  const filePath = path.join(dest, fileName);

  await writeFile(filePath, JSON.stringify(pkg, null, 2), 'utf8');
  generatedFiles.add(fileName);
}

module.exports = action('Write package.json', writePkg);

module.exports.update = action('Update package.json', writePkg);
