import { readdirSync, existsSync, readFileSync } from 'fs';
import { mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const dirName = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirName, '..', '..', '..');
const packagesDir = path.join(projectRoot, 'packages');

export default {
  name: 'config-plugin',
  hooks: {
    // Don't add templates to metadata - we'll handle them in docsGenerate instead
    // Configure docsSetup for packages
    docsSetup: () => {
      const moduleSetups = {};

      const localModules = readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() &&
          dirent.name !== 'gasket-typescript-tests'
        );

      localModules.forEach(dirent => {
        try {
          const pkgPath = path.join(packagesDir, dirent.name, 'package.json');
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
          const examplesPath = path.join(packagesDir, dirent.name, 'EXAMPLES.md');
          const hasExamples = existsSync(examplesPath);
          const isTemplate = dirent.name.startsWith('gasket-template-');

          // Skip templates - they'll be handled in docsGenerate
          if (isTemplate) return;

          // Only include non-templates that have EXAMPLES.md
          if (hasExamples) {
            const files = ['README.md', 'docs/**/*', 'EXAMPLES.md'];
            moduleSetups[pkg.name] = {
              link: 'README.md',
              files
            };
          }
        } catch {
          // ignore if package.json can't be read
        }
      });

      return { modules: moduleSetups };
    },
    // Add repo-level docs and generate template docs
    docsGenerate: {
      timing: {
        first: true
      },
      handler: async function docsGenerate(gasket, docsConfigSet) {
        const docs = [
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

        // Generate template docs in custom directory
        const { docsRoot } = docsConfigSet;
        const templatesDir = path.join(docsRoot, 'templates');

        const templateModules = readdirSync(packagesDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-template-'));

        for (const dirent of templateModules) {
          try {
            const pkgPath = path.join(packagesDir, dirent.name, 'package.json');
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
            const sourcePath = path.join(packagesDir, dirent.name);
            const targetPath = path.join(templatesDir, ...pkg.name.split('/'));

            // Copy README.md
            const readmePath = path.join(sourcePath, 'README.md');
            if (existsSync(readmePath)) {
              const targetReadmePath = path.join(targetPath, 'README.md');
              await mkdir(path.dirname(targetReadmePath), { recursive: true });
              await copyFile(readmePath, targetReadmePath);
            }

            // Copy EXAMPLES.md if it exists
            const examplesPath = path.join(sourcePath, 'EXAMPLES.md');
            if (existsSync(examplesPath)) {
              const targetExamplesPath = path.join(targetPath, 'EXAMPLES.md');
              await copyFile(examplesPath, targetExamplesPath);
            }

            docs.push({
              name: pkg.name,
              version: pkg.version,
              description: pkg.description || `Gasket template: ${pkg.name}`,
              link: `/templates/${pkg.name.split('/').join('/')}/README.md`,
              targetRoot: docsRoot
            });
          } catch (error) {
            gasket.logger?.warn(`Failed to process template ${dirent.name}:`, error.message);
          }
        }

        return docs;
      }
    }
  }
};
