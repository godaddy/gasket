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
    docsSetup: () => ({}),
    // Add repo-level docs in to the top of the guides section
    docsGenerate: {
      timing: {
        first: true
      },
      handler: async function docsGenerate(gasket, docsConfigSet) {
        return [
          {
            name: 'Quick Start Guide',
            description: 'Get up and running on Gasket',
            link: '/docs/quick-start.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Upgrades Guide',
            description: 'Steps necessary to upgrade major versions',
            link: '/docs/upgrades.md',
            targetRoot: docsConfigSet.docsRoot
          }];
      }
    }
  }
};
