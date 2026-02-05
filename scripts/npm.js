#!/usr/bin/env node

/* eslint-disable no-continue */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.join(__dirname, '../packages');

const OPERATIONS = {
  'npm-ci': {
    name: 'Installing dependencies',
    emoji: '📦',
    command: 'npm',
    args: ['ci', '--prefer-offline']
  },
  'build': {
    name: 'Building',
    emoji: '🔨',
    command: 'npm',
    args: ['run', 'build']
  },
  'test': {
    name: 'Testing',
    emoji: '🧪',
    command: 'npm',
    args: ['test'],
    env: { ESLINT_USE_FLAT_CONFIG: 'false' }
  },
  'lint': {
    name: 'Linting',
    emoji: '🔍',
    command: 'npx',
    args: ['eslint', '--ext', '.js,.jsx,.cjs,.ts,.tsx', '.'],
    env: { ESLINT_USE_FLAT_CONFIG: 'false' }
  },
  'clean': {
    name: 'Cleaning',
    emoji: '🧹',
    isCustom: true,
    handler: cleanHandler
  },
  'regen': {
    name: 'Regenerating lockfiles',
    emoji: '🔒',
    isCustom: true,
    handler: regenHandler
  }
};

/**
 * Recursively removes a directory and its contents
 * @param {string} dirPath - Path to the directory to remove
 * @returns {boolean} True if removal was successful
 */
function rmRecursive(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🗑️  Removed ${dirPath}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
    return false;
  }
}

/**
 * Cleans build artifacts from a template directory
 * @param {string} templateDir - Path to the template directory
 * @param {string} packageName - Name of the package being cleaned
 */
async function cleanHandler(templateDir, packageName) {
  console.log(`🧹 Cleaning ${packageName}/template`);

  const dirsToClean = [
    path.join(templateDir, 'dist'),
    path.join(templateDir, 'build'),
    path.join(templateDir, '.next'),
    path.join(templateDir, 'coverage'),
    path.join(templateDir, '.nyc_output'),
    path.join(templateDir, 'node_modules/.cache')
  ];

  let cleaned = false;
  for (const dirToClean of dirsToClean) {
    if (fs.existsSync(dirToClean)) {
      if (rmRecursive(dirToClean)) {
        cleaned = true;
      }
    }
  }

  if (cleaned) {
    console.log('✅ Complete\n');
  } else {
    console.log('✅ No build artifacts to clean\n');
  }
}

/**
 * Removes a single file
 * @param {string} filePath - Path to the file to remove
 * @returns {boolean} True if removal was successful
 */
function rmFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed ${filePath}`);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.log(`⚠️  Could not remove ${filePath}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Regenerates lockfiles for a template directory
 * @param {string} templateDir - Path to the template directory
 * @param {string} packageName - Name of the package
 */
async function regenHandler(templateDir, packageName) {
  console.log(`🔒 Regenerating lockfiles for ${packageName}/template`);

  // Remove existing lockfiles and node_modules
  const packageLockPath = path.join(templateDir, 'package-lock.json');
  const nodeModulesPath = path.join(templateDir, 'node_modules');

  let cleaned = false;

  if (fs.existsSync(packageLockPath)) {
    if (rmFile(packageLockPath)) {
      cleaned = true;
    }
  }

  if (fs.existsSync(nodeModulesPath)) {
    if (rmRecursive(nodeModulesPath)) {
      cleaned = true;
    }
  }

  if (cleaned) {
    console.log('🗑️  Cleaned existing lockfiles and node_modules');
  }

  // Check if package.json exists before trying to install
  const packageJsonPath = path.join(templateDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('⚠️  No package.json found, skipping npm install');
    console.log('✅ Complete\n');
    return;
  }

  // Run npm install to regenerate package-lock.json
  console.log('📦 Running npm install to regenerate lockfiles...');
  try {
    await runCommand('npm', ['install', '--registry', 'https://registry.npmjs.org/', '--force'], templateDir);
    console.log('✅ Lockfiles regenerated successfully\n');
  } catch (error) {
    console.log(`❌ Failed to regenerate lockfiles: ${error.message}\n`);
    throw error;
  }
}

/**
 * Determines if npm ci should be skipped for a template directory
 * @param {string} templateDir - Path to the template directory
 * @returns {boolean} True if npm ci should be skipped
 */
function shouldSkipNpmCi(templateDir) {
  const nodeModulesPath = path.join(templateDir, 'node_modules');
  const packageJsonPath = path.join(templateDir, 'package.json');
  const packageLockPath = path.join(templateDir, 'package-lock.json');

  // If node_modules doesn't exist, we need to install
  if (!fs.existsSync(nodeModulesPath)) {
    return false;
  }

  // Check if node_modules has content
  try {
    const nodeModulesContents = fs.readdirSync(nodeModulesPath);
    if (nodeModulesContents.length === 0) {
      return false;
    }
  } catch {
    return false;
  }

  // Get node_modules modification time
  let nodeModulesStat;
  try {
    nodeModulesStat = fs.statSync(nodeModulesPath);
  } catch {
    return false;
  }

  // Check if any lock file or package.json is newer than node_modules
  const filesToCheck = [packageJsonPath, packageLockPath]
    .filter(filePath => fs.existsSync(filePath));

  for (const filePath of filesToCheck) {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.mtime > nodeModulesStat.mtime) {
        return false; // File is newer, need to reinstall
      }
    } catch {
      // If we can't stat the file, continue checking others
    }
  }

  return true; // node_modules is up to date
}

/**
 * Runs a command in a specified directory with custom environment variables
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @param {string} cwd - Working directory for the command
 * @param {object} customEnv - Custom environment variables
 * @returns {Promise<void>} Resolves when command completes successfully
 */
async function runCommand(command, args, cwd, customEnv = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')} in ${cwd}`);

    // Ensure we use the template's local node_modules/.bin
    const localBin = path.join(cwd, 'node_modules', '.bin');

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        PATH: `${localBin}${path.delimiter}${process.env.PATH}`,
        ...customEnv
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 *
 */
function showUsage() {
  console.log('Usage: node scripts/npm.js <operation>');
  console.log('');
  console.log('Available operations:');
  Object.keys(OPERATIONS).forEach(op => {
    const config = OPERATIONS[op];
    console.log(`  ${op.padEnd(10)} - ${config.name} template packages`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/npm.js npm-ci');
  console.log('  node scripts/npm.js build');
  console.log('  node scripts/npm.js lint');
  console.log('  node scripts/npm.js test');
  console.log('  node scripts/npm.js clean');
  console.log('  node scripts/npm.js regen');
}

/**
 *
 */
async function main() {
  const operation = process.argv[2];

  if (!operation || !OPERATIONS[operation]) {
    showUsage();
    process.exit(1);
  }

  const config = OPERATIONS[operation];

  try {
    // Find all template packages
    const packageDirs = fs.readdirSync(packagesDir)
      .filter(dir => dir.startsWith('gasket-template-'))
      .map(dir => path.join(packagesDir, dir));

    console.log(`Found ${packageDirs.length} template packages:`);
    packageDirs.forEach(dir => console.log(`  - ${path.basename(dir)}`));
    console.log('');

    // Process each template package
    for (const packageDir of packageDirs) {
      const templateDir = path.join(packageDir, 'template');
      const packageJsonPath = path.join(templateDir, 'package.json');
      const packageName = path.basename(packageDir);

      // Check if template directory exists
      if (!fs.existsSync(templateDir)) {
        console.log(`⚠️  Skipping ${packageName} - no template directory found\n`);
        continue;
      }

      // For clean operation, we don't need package.json
      if (config.isCustom) {
        await config.handler(templateDir, packageName);
        continue;
      }

      // For other operations, check if package.json exists
      if (!fs.existsSync(packageJsonPath)) {
        console.log(`⚠️  Skipping ${packageName} - no template/package.json found\n`);
        continue;
      }

      // Special handling for npm-ci to skip if dependencies are up to date
      if (operation === 'npm-ci' && shouldSkipNpmCi(templateDir)) {
        console.log(`⚡ Skipping ${packageName}/template - dependencies are up to date\n`);
        continue;
      }

      console.log(`${config.emoji} ${config.name} ${packageName}/template`);
      await runCommand(config.command, config.args, templateDir, config.env);
      console.log('✅ Complete\n');
    }

    console.log(`🎉 All template packages ${operation} completed successfully!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
