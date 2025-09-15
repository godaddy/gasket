#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.join(__dirname, '../../packages');

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')} in ${cwd}`);

    // Ensure we use the template's local node_modules/.bin
    const localBin = path.join(cwd, 'node_modules', '.bin');
    const env = {
      ...process.env,
      PATH: `${localBin}${path.delimiter}${process.env.PATH}`,
      ESLINT_USE_FLAT_CONFIG: 'false'
    };

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
      env
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

async function main() {
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

      // Check if template directory and package.json exist
      if (fs.existsSync(templateDir) && fs.existsSync(packageJsonPath)) {
        console.log(`🔍 Linting ${path.basename(packageDir)}/template`);
        await runCommand('npx', ['eslint', '--ext', '.js,.jsx,.cjs,.ts,.tsx', '.'], templateDir);
        console.log('✅ Complete\n');
      } else {
        console.log(`⚠️  Skipping ${path.basename(packageDir)} - no template/package.json found\n`);
      }
    }

    console.log('🎉 All template packages linted successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
