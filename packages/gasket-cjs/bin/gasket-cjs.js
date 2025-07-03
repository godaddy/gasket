#!/usr/bin/env node

import { transpile } from '../lib/index.js';
import { resolve } from 'path';
import { existsSync } from 'fs';

/**
 * Display help message
 */
function showHelp() {
  console.log(`
gasket-cjs - Transpile ESM to CJS with .cjs extensions

Usage:
  gasket-cjs <source-directory> [output-directory]

Arguments:
  source-directory    Source directory containing ESM files (default: ./lib)
  output-directory    Output directory for CJS files (default: ./cjs)

Options:
  -h, --help          Show this help message
  -v, --version       Show version information

Examples:
  gasket-cjs ./src
  gasket-cjs ./lib ./dist/cjs
  gasket-cjs ./src ./output
`);
}

/**
 * Display version information
 */
async function showVersion() {
  // Read version from package.json
  try {
    const packageJsonPath = new URL('../package.json', import.meta.url);
    const { readFileSync } = await import('fs');
    const packageContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    console.log(`gasket-cjs v${packageJson.version}`);
  } catch (error) {
    console.log('gasket-cjs v7.0.0');
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);

  // Handle help flag
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Handle version flag
  if (args.includes('-v') || args.includes('--version')) {
    await showVersion();
    process.exit(0);
  }

  // Parse arguments
  const sourceDir = args[0] || './lib';
  const outputDir = args[1] || './cjs';

  // Resolve to absolute paths
  const absoluteSourceDir = resolve(sourceDir);
  const absoluteOutputDir = resolve(outputDir);

  // Validate source directory exists
  if (!existsSync(absoluteSourceDir)) {
    console.error(`❌ Error: Source directory '${sourceDir}' does not exist`);
    process.exit(1);
  }

  console.log(`🔄 Transpiling ESM to CJS...`);
  console.log(`   Source: ${absoluteSourceDir}`);
  console.log(`   Output: ${absoluteOutputDir}`);
  console.log('');

  try {
    const result = await transpile(absoluteSourceDir, absoluteOutputDir, {
      onProgress: ({ file, current, total }) => {
        const percentage = Math.round((current / total) * 100);
        const fileName = file.split('/').pop();
        console.log(`   [${current}/${total}] ${percentage}% - ${fileName}`);
      }
    });

    console.log('');
    console.log(`✅ Transpilation complete!`);
    console.log(`   Successfully transpiled: ${result.successful.length} files`);

    if (result.failed.length > 0) {
      console.log(`   Failed: ${result.failed.length} files`);
      console.log('');
      console.log('❌ Failed files:');
      result.failed.forEach(failure => {
        console.log(`   - ${failure.inputPath}: ${failure.error}`);
      });
      process.exit(1);
    }

    console.log(`   Output directory: ${result.outputDir}`);
    console.log('');

  } catch (error) {
    console.error(`❌ Error during transpilation: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI
main().catch(error => {
  console.error(`❌ Unexpected error: ${error.message}`);
  process.exit(1);
});

