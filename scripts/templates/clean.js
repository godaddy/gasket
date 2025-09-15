#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.join(__dirname, '../../packages');

function rmRecursive(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🗑️  Removed ${dirPath}`);
  } catch (error) {
    console.log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
  }
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

      if (fs.existsSync(templateDir)) {
        console.log(`🧹 Cleaning ${path.basename(packageDir)}/template`);

        // Common build/cache directories to clean
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
            rmRecursive(dirToClean);
            cleaned = true;
          }
        }

        if (cleaned) {
          console.log('✅ Complete\n');
        } else {
          console.log('✅ No build artifacts to clean\n');
        }
      } else {
        console.log(`⚠️  Skipping ${path.basename(packageDir)} - no template directory found\n`);
      }
    }

    console.log('🎉 All template packages cleaned!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
