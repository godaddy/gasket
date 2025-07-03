import { transform } from '@swc/core';
import globPkg from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, relative } from 'path';

const { glob } = globPkg;

/**
 * Default SWC configuration for ESM to CJS transpilation
 */
const DEFAULT_SWC_CONFIG = {
  module: {
    type: 'commonjs',
    strict: false,
    strictMode: false,
    lazy: false,
    noInterop: false
  },
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: false,
      dynamicImport: true,
      privateMethod: false,
      functionBind: false,
      exportDefaultFrom: false,
      exportNamespaceFrom: false,
      decorators: false,
      decoratorsBeforeExport: false,
      topLevelAwait: false,
      importMeta: false
    },
    target: 'es2020',
    loose: false,
    externalHelpers: false,
    keepClassNames: false
  },
  minify: false,
  isModule: true
};

/**
 * Transpile a single file from ESM to CJS
 * @param {string} filePath - Path to the source file
 * @param {string} outputPath - Path to the output file
 * @param {object} [swcConfig] - Custom SWC configuration
 * @returns {Promise<object>} Transpilation result
 */
export async function transpileFile(filePath, outputPath, swcConfig = DEFAULT_SWC_CONFIG) {
  try {
    const sourceCode = readFileSync(filePath, 'utf-8');
    const result = await transform(sourceCode, swcConfig);

    // Ensure output directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Write the transpiled code
    writeFileSync(outputPath, result.code, 'utf-8');

    return { success: true, inputPath: filePath, outputPath };
  } catch (error) {
    return { success: false, inputPath: filePath, outputPath, error: error.message };
  }
}

/**
 * Transpile all JavaScript files in a directory from ESM to CJS
 * @param {string} sourceDir - Source directory path
 * @param {string} outputDir - Output directory path
 * @param {object} options - Additional options
 * @param {object} options.swcConfig - Custom SWC configuration
 * @param {string[]} options.extensions - File extensions to process
 * @param {boolean} options.createPackageJson - Create package.json in output dir
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Array>} Array of transpilation results
 */
export async function transpileDirectory(sourceDir, outputDir = 'cjs', options = {}) {
  const {
    swcConfig = DEFAULT_SWC_CONFIG,
    extensions = ['.js', '.mjs'],
    createPackageJson = true,
    onProgress
  } = options;

  // Find all JavaScript files
  const pattern = `${sourceDir}/**/*.{${extensions.map(ext => ext.slice(1)).join(',')}}`;
  const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/test/**', '**/tests/**'] });

  const results = [];

  for (const file of files) {
    const relativePath = relative(sourceDir, file);
    const outputPath = join(outputDir, relativePath).replace(/\.(js|mjs)$/, '.cjs');

    if (onProgress) {
      onProgress({ file, outputPath, current: results.length + 1, total: files.length });
    }

    const result = await transpileFile(file, outputPath, swcConfig);
    results.push(result);
  }

  // Create package.json in output directory if requested
  if (createPackageJson && !existsSync(join(outputDir, 'package.json'))) {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, 'package.json'), '{}', 'utf-8');
  }

  return results;
}

/**
 * Fix import/require statements to use .cjs extensions
 * @param {string} outputDir - Directory containing transpiled files
 */
export async function fixImportExtensions(outputDir) {
  const pattern = `${outputDir}/**/*.cjs`;
  const files = glob.sync(pattern);

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');

    // Replace .js" with .cjs" in require statements
    content = content.replace(/\.js"/g, '.cjs"');
    content = content.replace(/\.mjs"/g, '.cjs"');

    writeFileSync(file, content, 'utf-8');
  }
}

/**
 * Main transpilation function
 * @param {string} sourceDir - Source directory path
 * @param {string} outputDir - Output directory path
 * @param {object} options - Additional options
 * @returns {Promise<object>} Transpilation summary
 */
export async function transpile(sourceDir, outputDir = 'cjs', options = {}) {
  const results = await transpileDirectory(sourceDir, outputDir, options);
  await fixImportExtensions(outputDir);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  return {
    successful,
    failed,
    total: results.length,
    outputDir
  };
}

