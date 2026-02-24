/**
 * Template package discovery.
 *
 * Finds all packages matching the template filter and extracts
 * metadata about their template/ subdirectories.
 */

import fs from 'fs';
import path from 'path';

/**
 * Discover template packages in the monorepo.
 * @param {object} config - Configuration object
 * @param {string} config.packagesDir - Path to packages directory
 * @param {string} config.templateFilter - Prefix filter for package names
 * @returns {Array<object>} Array of template metadata objects
 * @example
 *   discoverTemplates({ packagesDir: '/repo/packages', templateFilter: 'gasket-template-' })
 *   // => [
 *   //   {
 *   //     name: 'gasket-template-webapp-app',
 *   //     packageDir: '/repo/packages/gasket-template-webapp-app',
 *   //     templateDir: '/repo/packages/gasket-template-webapp-app/template',
 *   //     hasPackageJson: true,
 *   //     hasNodeModules: true,
 *   //     hasLockfile: true
 *   //   },
 *   //   ...
 *   // ]
 */
export function discoverTemplates(config) {
  const { packagesDir, templateFilter } = config;

  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith(templateFilter))
    .map(d => path.join(packagesDir, d.name));

  return dirs.map((packageDir) => {
    const name = path.basename(packageDir);
    const templateDir = path.join(packageDir, 'template');
    const packageJsonPath = path.join(templateDir, 'package.json');
    const nodeModulesPath = path.join(templateDir, 'node_modules');
    const lockPath = path.join(templateDir, 'package-lock.json');

    return {
      name,
      packageDir,
      templateDir,
      hasPackageJson: fs.existsSync(packageJsonPath),
      hasNodeModules: fs.existsSync(nodeModulesPath),
      hasLockfile: fs.existsSync(lockPath)
    };
  }).filter(t => fs.existsSync(t.templateDir));
}
