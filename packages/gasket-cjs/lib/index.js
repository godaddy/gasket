import { transform } from '@swc/core';
import { globSync } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { dirname, join, relative } from 'path';

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
 * Preprocess source code to convert unsupported syntax
 * @param {string} sourceCode - Source code to preprocess
 * @returns {string} Preprocessed source code
 */
function preprocessSource(sourceCode) {
  // Convert `import ... with { type: 'json' }` to regular import
  // SWC doesn't support import attributes, but CJS require() can handle JSON
  return sourceCode.replace(
    /import\s+(\w+)\s+from\s+(['"])([^'"]+\.json)\2\s+with\s+\{\s*type:\s*['"]json['"]\s*\};?/g,
    'import $1 from $2$3$2;'
  );
}

/**
 * Transpile a single file from ESM to CJS
 * @param {string} filePath - Path to the source file
 * @param {string} outputPath - Path to the output file
 * @param {object} [swcConfig] - Custom SWC configuration
 * @returns {Promise<object>} Transpilation result
 */
export async function transpileFile(filePath, outputPath, swcConfig = DEFAULT_SWC_CONFIG) {
  try {
    let sourceCode = readFileSync(filePath, 'utf-8');
    sourceCode = preprocessSource(sourceCode);
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
 * Clean output directory if it exists
 * @param {string} outputDir - Output directory path
 */
export function cleanOutputDirectory(outputDir) {
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
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
 * @param {boolean} options.clean - Clean output directory before transpilation
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Array>} Array of transpilation results
 */
export async function transpileDirectory(sourceDir, outputDir = 'cjs', options = {}) {
  const {
    swcConfig = DEFAULT_SWC_CONFIG,
    extensions = ['.js', '.mjs'],
    createPackageJson = true,
    clean = true,
    onProgress
  } = options;

  // Clean output directory if requested
  if (clean) {
    cleanOutputDirectory(outputDir);
  }

  // Find all JavaScript files
  const pattern = `${sourceDir}/**/*.{${extensions.map(ext => ext.slice(1)).join(',')}}`;
  const files = globSync(pattern, { ignore: ['**/node_modules/**', '**/test/**', '**/tests/**'] });

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

// Only match relative .js/.mjs paths in double quotes
// Example: "./foo.js", "../bar.mjs", "/baz.js"
const reFileRef = /(?<=")(\.{1,2}\/|\/)[^"]*?(\.m?js)(?=")/g;

// Match .js or .mjs file extensions
const reFileExt = /\.(m?js)$/;

/**
 * Fix import/require statements to use .cjs extensions
 * @param {string} outputDir - Directory containing transpiled files
 */
export async function fixImportExtensions(outputDir) {
  const pattern = `${outputDir}/**/*.cjs`;
  const files = globSync(pattern);


  for (const file of files) {
    let content = readFileSync(file, 'utf-8');

    // Replace only local/relative .js/.mjs with .cjs
    content = content.replace(reFileRef, (match) => {
      return match.replace(reFileExt, '.cjs');
    });

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
