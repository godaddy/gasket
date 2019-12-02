/* eslint-disable no-console, no-sync */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..', '..');
const packagesDir = path.join(projectRoot, 'packages');

async function metadata(gasket, data) {
  const modules = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() &&
      !dirent.name.startsWith('gasket-plugin-') && !dirent.name.startsWith('gasket-preset-')
    )
    .map(dirent => path.join(packagesDir, dirent.name));

  return {
    ...data,
    modules
  };
}


module.exports = {
  hooks: {
    metadata,
    docsSetup: () => ({})
  }
};
