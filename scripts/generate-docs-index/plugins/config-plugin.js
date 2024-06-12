/* eslint-disable no-console, no-sync */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.resolve(__dirname, '..', '..', '..');
// const packagesDir = path.join(projectRoot, 'packages');

export default {
  name: 'config-plugin',
  hooks: {
    async metadata(gasket, meta) {
      return meta;
    },
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
