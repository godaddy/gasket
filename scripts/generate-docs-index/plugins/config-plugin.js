import { readdirSync, existsSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const packagesDir = path.join(projectRoot, 'packages');

export default {
  name: 'config-plugin',
  hooks: {
    // Keeps the generator app readme out of the index
    docsSetup: () => {
      // Register docsSetup for local modules that need it
      const moduleSetups = {};

      const localModules = readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() &&
          dirent.name !== 'gasket-typescript-tests'
        );

      localModules.forEach(dirent => {
        try {
          const mod = require(path.join(packagesDir, dirent.name, 'package.json'));
          // Check if EXAMPLES.md exists for this package
          const examplesPath = path.join(packagesDir, dirent.name, 'EXAMPLES.md');
          const hasExamples = existsSync(examplesPath);

          const files = ['README.md', 'docs/**/*'];
          if (hasExamples) {
            files.push('EXAMPLES.md');
          }

          moduleSetups[mod.name] = {
            link: 'README.md',
            files
          };
        } catch {
          // ignore if package.json can't be read
        }
      });

      return { modules: moduleSetups };
    },
    // Add repo-level docs to the top of the guides section
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
          },
          {
            name: 'Gasket Actions Guide',
            description: 'How to use access data and invoke lifecycles',
            link: '/docs/gasket-actions.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Intl Quick Start Guide',
            description: 'Add internationalization to your app',
            link: '/docs/intl-quick-start.md',
            targetRoot: docsConfigSet.docsRoot
          }
        ];
      }
    }
  }
};
