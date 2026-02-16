

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

// Get __dirname equivalent for ESM
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Resolve paths relative to the monorepo root
const rootDir = path.resolve(dirName, '..'); // Move up from `scripts/`
const packagesDir = path.join(rootDir, 'packages');
const workspaceYamlPath = path.join(rootDir, 'pnpm-workspace.yaml');
const rootPackageJsonPath = path.join(rootDir, 'package.json'); // Root package.json
const generateDocsIndexDir = path.join(rootDir, 'scripts', 'generate-docs-index');
const generateDocsIndexPkgPath = path.join(generateDocsIndexDir, 'package.json');

const workspacePackages = {};

// Load workspace-defined package versions
if (fs.existsSync(workspaceYamlPath)) {
  console.log(`Loading workspace package versions from ${workspaceYamlPath}`);
  const workspaceYaml = yaml.load(fs.readFileSync(workspaceYamlPath, 'utf8'));

  if (workspaceYaml?.packages) {
    workspaceYaml.packages.forEach(pkgGlob => {
      const pkgGlobPath = path.join(rootDir, pkgGlob.replace('/*', ''));

      if (fs.existsSync(pkgGlobPath)) {
        const pkgDirs = fs.readdirSync(pkgGlobPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => path.join(pkgGlobPath, dirent.name));

        pkgDirs.forEach(pkgPath => {
          const pkgJsonPath = path.join(pkgPath, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            if (pkgJson.name && pkgJson.version) {
              workspacePackages[pkgJson.name] = `^${pkgJson.version}`;
              console.log(`Found workspace package: ${pkgJson.name}@${pkgJson.version}`);
            }
          }
        });
      }
    });
  }
}

/**
 * Update a given package.json file
 * @param {string} packageJsonPath - Path to the package.json file
 */
function updatePackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) return;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;

  /**
   * Replaces workspace dependency versions with actual versions
   * @param {string} depType - Type of dependency (dependencies, devDependencies, etc.)
   */
  function replaceDependencyVersions(depType) {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach(pkg => {
        const currentVersion = packageJson[depType][pkg];

        // Replace workspace: with actual workspace version
        if (currentVersion.startsWith('workspace:') && workspacePackages[pkg]) {
          console.log(`Updating ${pkg} from workspace:^ to ${workspacePackages[pkg]} in ${packageJsonPath}`);
          packageJson[depType][pkg] = workspacePackages[pkg];
          updated = true;
        }
      });
    }
  }

  // Update dependencies in package.json
  ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].forEach(replaceDependencyVersions);

  // Write back to package.json only if there are updates
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${packageJsonPath}`);
  }
}

/**
 * Update root package.json
 */
console.log('Checking root package.json...');
updatePackageJson(rootPackageJsonPath);

/**
 * Update package.json files in packages/
 */
if (fs.existsSync(packagesDir)) {
  console.log('Checking package.json files in packages/');
  fs.readdirSync(packagesDir).forEach(packageName => {
    const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
    updatePackageJson(packageJsonPath);
  });
}

/**
 * Update package.json in scripts/generate-docs-index
 */
if (fs.existsSync(generateDocsIndexPkgPath)) {
  console.log('Checking package.json in scripts/generate-docs-index/');
  updatePackageJson(generateDocsIndexPkgPath);
}

console.log('🎉 All package.json files updated with workspace.');
