import path from 'path';
import { writeFile } from 'fs/promises';
import { withSpinner } from '../with-spinner.js';

/**
 * Writes the contents of `pkg` to the app's package.json.
 * @type {import('../../internal.js').writePkg}
 */
async function writePkg({ context }) {
  const { dest, pkg, generatedFiles } = context;
  const fileName = 'package.json';
  const filePath = path.join(dest, fileName);
  await writeFile(filePath, JSON.stringify(pkg, null, 2), 'utf8');
  generatedFiles.add(fileName);
}

export default withSpinner('Write package.json', writePkg);
