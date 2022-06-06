const { writeFile, readFile } = require('fs').promises;
const path = require('path');

/**
 * Generates the LICENSE.md
 *
 * @param {DocsConfigSet} docsConfigSet - Docs generation configs
 */
async function generateLicense(docsConfigSet) {
  const { docsRoot } = docsConfigSet;
  const target = path.join(docsRoot, 'LICENSE.md');
  // License exists at plugin root
  const source = path.join(__dirname, '..', '..', 'LICENSE.md');
  await writeFile(
    target,
    await readFile(source, 'utf-8'),
    'utf-8'
  );
}

module.exports = generateLicense;
