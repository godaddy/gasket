#!/usr/bin/env node

import { Command } from 'commander';
import { transpile } from '../lib/index.js';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const program = new Command();

// Read version from package.json
const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

program
  .name('gasket-cjs')
  .description('Transpile ESM to CJS with .cjs extensions')
  .version(packageJson.version)
  .argument('[source-directory]', 'Source directory containing ESM files', './lib')
  .argument('[output-directory]', 'Output directory for CJS files', './cjs')
  .action(async (sourceDir, outputDir) => {
    // Resolve to absolute paths
    const absoluteSourceDir = resolve(sourceDir);
    const absoluteOutputDir = resolve(outputDir);

    // Validate source directory exists
    if (!existsSync(absoluteSourceDir)) {
      console.error(`❌ Error: Source directory '${sourceDir}' does not exist`);
      process.exit(1);
    }

    console.log(`Transpiling ${sourceDir} → ${outputDir}`);

    try {
      const result = await transpile(absoluteSourceDir, absoluteOutputDir, {
        onProgress: ({ current, total }) => {
          process.stdout.write(`\r${current}/${total} files processed`);
        }
      });

      console.log(`\n✅ ${result.successful.length} files transpiled`);

      if (result.failed.length > 0) {
        console.log(`❌ ${result.failed.length} files failed:`);
        result.failed.forEach(failure => {
          console.log(`  ${failure.inputPath}: ${failure.error}`);
        });
        process.exit(1);
      }

    } catch (error) {
      console.error(`❌ Error during transpilation: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();

