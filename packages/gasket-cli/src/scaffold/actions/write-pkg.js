import path from 'path';
import { writeFile } from 'fs/promises';
import action from '../action-wrapper.js';

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

export default action('Write package.json', writePkg);

export const update = action('Update package.json', writePkg);
