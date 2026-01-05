#!/usr/bin/env node
/**
 * Verifies that all dot files in template directories are included during npm pack
 * @example node scripts/templates-validate-dotfiles.js
 */

/* eslint-disable no-continue */

import { execSync } from 'child_process';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');

// Expected dot files that should exist in template directories (with .template suffix)
const EXPECTED_DOT_FILES = ['.npmrc.template', '.gitignore.template'];

// Dot files that are allowed to exist in templates without being packed
// (e.g., .gitignore for the template's own development needs)
const ALLOWED_UNPACKED_DOT_FILES = ['.gitignore'];

/**
 * Parse .gitignore file and return patterns
 * @param {string} gitignorePath - Path to .gitignore file
 * @returns {string[]} Array of ignore patterns
 */
function parseGitignore(gitignorePath) {
  if (!existsSync(gitignorePath)) {
    return [];
  }

  const content = readFileSync(gitignorePath, 'utf8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => {
      // Remove leading ./ if present
      if (pattern.startsWith('./')) {
        pattern = pattern.slice(2);
      }
      // Remove negation prefix for checking
      if (pattern.startsWith('!')) {
        pattern = pattern.slice(1);
      }
      return pattern;
    });
}

/**
 * Check if a file/directory name matches gitignore patterns
 * @param {string} name - File or directory name (not full path)
 * @param {string[]} patterns - Gitignore patterns
 * @returns {boolean} True if the name should be ignored
 */
function isIgnored(name, patterns) {
  for (const pattern of patterns) {
    // Exact match
    if (pattern === name) {
      return true;
    }
    // Pattern with trailing slash (directory)
    if (pattern.endsWith('/') && pattern.slice(0, -1) === name) {
      return true;
    }
    // Wildcard patterns (simple implementation)
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      if (regex.test(name)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Recursively find all dot files in a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for relative paths
 * @param {string[]} ignorePatterns - Patterns from .gitignore
 * @returns {string[]} Array of relative paths to dot files
 */
function findDotFiles(dir, baseDir, ignorePatterns = []) {
  const dotFiles = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    // Skip if matches gitignore patterns
    if (isIgnored(entry.name, ignorePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      // Recursively search all directories except node_modules and .git
      dotFiles.push(...findDotFiles(fullPath, baseDir, ignorePatterns));
    } else if (entry.name.startsWith('.')) {
      // Found a dot file
      const relativePath = relative(baseDir, fullPath);
      dotFiles.push(relativePath);
    }
  }

  return dotFiles;
}

/**
 * Get list of files that would be packed by npm
 * @param {string} packageDir - Path to package directory
 * @returns {string[]} Array of file paths that would be packed
 */
function getPackedFiles(packageDir) {
  try {
    const output = execSync('npm pack --dry-run --json', {
      cwd: packageDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const packData = JSON.parse(output);
    // npm pack --json returns an array with one element
    const files = packData[0]?.files || [];
    return files.map(f => f.path);
  } catch (error) {
    console.error(`Error running npm pack in ${packageDir}:`, error.message);
    return [];
  }
}

/**
 * Verify a single template package
 * @param {string} packageName - Name of the package
 * @returns {object} Verification result
 */
function verifyTemplatePackage(packageName) {
  const packageDir = join(PACKAGES_DIR, packageName);
  const templateDir = join(packageDir, 'template');

  // Check if template directory exists
  try {
    statSync(templateDir);
  } catch {
    // No template directory, skip
    return { packageName, skipped: true };
  }

  console.log(`\n${chalk.bold('Verifying ' + packageName + '...')}`);

  // Parse .gitignore if it exists
  const gitignorePath = join(templateDir, '.gitignore');
  const ignorePatterns = parseGitignore(gitignorePath);

  if (ignorePatterns.length > 0) {
    console.log(chalk.gray(`  Ignoring ${ignorePatterns.length} pattern(s) from .gitignore`));
  }

  // Find all dot files in the template directory
  const dotFiles = findDotFiles(templateDir, packageDir, ignorePatterns);
  const dotFileNames = dotFiles.map(f => f.split('/').pop());

  // Check for missing expected dot files
  const missingExpectedFiles = EXPECTED_DOT_FILES.filter(
    expectedFile => !dotFileNames.includes(expectedFile)
  );

  if (missingExpectedFiles.length > 0) {
    console.log(chalk.yellow(`  WARNING: ${missingExpectedFiles.length} expected dot file(s) not found:`));
    missingExpectedFiles.forEach(file => console.log(chalk.yellow(`    ⚠  ${file}`)));
  }

  if (dotFiles.length === 0) {
    console.log(chalk.gray(`  No dot files found in template directory`));
    return { packageName, dotFiles: [], missingFiles: [], missingExpectedFiles };
  }

  console.log(chalk.gray(`  Found ${dotFiles.length} dot file(s) in template directory:`));
  dotFiles.forEach(file => console.log(chalk.gray(`    - ${file}`)));

  // Get list of files that would be packed
  const packedFiles = getPackedFiles(packageDir);

  // Check which dot files are missing from the pack list
  // Exclude files that are intentionally not packed (like .gitignore for template dev)
  const missingFiles = dotFiles.filter(dotFile => {
    const fileName = dotFile.split('/').pop();
    if (ALLOWED_UNPACKED_DOT_FILES.includes(fileName)) {
      return false;
    }
    return !packedFiles.includes(dotFile);
  });

  if (missingFiles.length > 0) {
    console.log(chalk.red(`  ERROR: ${missingFiles.length} dot file(s) will NOT be packed:`));
    missingFiles.forEach(file => console.log(chalk.red(`    ✗ ${file}`)));
  } else {
    console.log(chalk.green(`  ✓ All dot files will be packed`));
  }

  return { packageName, dotFiles, missingFiles, missingExpectedFiles };
}

/**
 * Main function
 * @returns {number} Exit code (0=success, 1=failure)
 */
function main() {
  console.log(chalk.bold('Verifying template dot files are included in npm pack...\n'));
  console.log(chalk.gray('='.repeat(70)));

  // Find all template packages
  const packages = readdirSync(PACKAGES_DIR)
    .filter(name => name.startsWith('gasket-template-'));

  if (packages.length === 0) {
    console.log('No template packages found.');
    return 0;
  }

  console.log(chalk.gray(`Found ${packages.length} template package(s)\n`));

  // Verify each package
  const results = packages.map(verifyTemplatePackage);

  // Summary
  console.log('\n' + chalk.gray('='.repeat(70)));
  console.log(chalk.bold('SUMMARY\n'));

  const verifiedPackages = results.filter(r => !r.skipped);
  const packagesWithMissingFiles = verifiedPackages.filter(r => r.missingFiles.length > 0);
  const packagesWithMissingExpected = verifiedPackages.filter(r => r.missingExpectedFiles?.length > 0);

  console.log(chalk.gray(`Total template packages: ${packages.length}`));
  console.log(chalk.gray(`Verified: ${verifiedPackages.length}`));
  console.log(chalk.gray(`Skipped (no template dir): ${results.filter(r => r.skipped).length}`));

  let hasErrors = false;

  if (packagesWithMissingExpected.length > 0) {
    console.log(chalk.yellow(
      `\n ⚠️  WARNING: ${packagesWithMissingExpected.length} package(s) missing expected dot files:\n`
    ));
    packagesWithMissingExpected.forEach(({ packageName, missingExpectedFiles }) => {
      console.log(chalk.yellow(`  ${packageName}:`));
      missingExpectedFiles.forEach(file => console.log(chalk.yellow(`    - ${file}`)));
    });
  }

  if (packagesWithMissingFiles.length > 0) {
    console.log(chalk.red.bold(
      `\n ❌ FAILED: ${packagesWithMissingFiles.length} package(s) have dot files that will not be packed:\n`
    ));
    packagesWithMissingFiles.forEach(({ packageName, missingFiles }) => {
      console.log(chalk.red(`  ${packageName}:`));
      missingFiles.forEach(file => console.log(chalk.red(`    - ${file}`)));
    });
    hasErrors = true;
  }

  if (hasErrors) {
    return 1;
  }

  console.log(chalk.green.bold('\n ✅ SUCCESS: All dot files in template directories will be packed'));
  return 0;
}

// Run the script
const exitCode = main();
process.exit(exitCode);
