const path = require('path');
const { writeFile } = require('fs').promises;
// TODO: document this
module.exports = async function createPackageFile(docsConfigSet) {
  const { docsRoot } = docsConfigSet;
  const target = path.join(docsRoot, '..', 'package.json');
  await writeFile(target, JSON.stringify({}), 'utf-8');
};
