# @gasket/cjs Examples

This document provides working examples for all exported functions and interfaces from `@gasket/cjs`.

## Functions

### CLI Usage (Recommended)

The easiest way to use `@gasket/cjs` is through the command line interface.

```bash
# Transpile from ./lib to ./cjs (default)
gasket-cjs

# Transpile from custom source directory
gasket-cjs ./src

# Transpile to custom output directory
gasket-cjs ./src ./dist/cjs

# Check version and help
gasket-cjs --version
gasket-cjs --help
```

### `transpile` (Programmatic API)

For programmatic usage, use the transpile function with automatic import fixing.

```javascript
import { transpile } from '@gasket/cjs';

// Basic usage - transpile ./lib to ./cjs
const result = await transpile('./lib', './cjs');
console.log(`${result.successful.length} files transpiled successfully`);
console.log(`${result.failed.length} files failed`);

// With custom options
const result = await transpile('./src', './dist/cjs', {
  extensions: ['.js', '.mjs', '.ts'],
  createPackageJson: true,
  onProgress: ({ file, current, total }) => {
    console.log(`Processing ${file} (${current}/${total})`);
  },
  swcConfig: {
    jsc: {
      target: 'es2018'
    }
  }
});
```

### `transpileFile`

Transpile a single file from ESM to CJS.

```javascript
import { transpileFile } from '@gasket/cjs';

// Basic file transpilation
const result = await transpileFile('./src/module.js', './cjs/module.cjs');

if (result.success) {
  console.log(`Successfully transpiled: ${result.inputPath} → ${result.outputPath}`);
} else {
  console.error(`Failed to transpile: ${result.error}`);
}

// With custom SWC config
const customConfig = {
  module: { type: 'commonjs' },
  jsc: { target: 'es2020' }
};

const result = await transpileFile(
  './src/advanced.js',
  './cjs/advanced.cjs',
  customConfig
);
```

### `transpileDirectory`

Transpile all JavaScript files in a directory.

```javascript
import { transpileDirectory } from '@gasket/cjs';

// Basic directory transpilation
const results = await transpileDirectory('./src', './cjs');
console.log(`Processed ${results.length} files`);

// With comprehensive options
const results = await transpileDirectory('./lib', './build/cjs', {
  extensions: ['.js', '.mjs'],
  createPackageJson: true,
  onProgress: (progress) => {
    const percent = Math.round((progress.current / progress.total) * 100);
    console.log(`${percent}% - ${progress.file}`);
  },
  swcConfig: {
    module: {
      type: 'commonjs',
      strict: false
    },
    jsc: {
      target: 'es2020',
      parser: {
        syntax: 'ecmascript',
        dynamicImport: true
      }
    }
  }
});

// Check results
const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);
console.log(`✅ ${successful.length} succeeded, ❌ ${failed.length} failed`);
```

### `fixImportExtensions`

Fix import/require statements to use .cjs extensions.

```javascript
import { fixImportExtensions } from '@gasket/cjs';

// Fix all .cjs files in output directory
await fixImportExtensions('./cjs');

// This transforms:
// import { helper } from './helper.js'     → './helper.cjs'
// const util = require('../util.mjs')      → '../util.cjs'
// import abs from '/absolute/path.js'      → '/absolute/path.cjs'

// But preserves:
// import React from 'react'                → unchanged (bare import)
// import next from 'next/document.js'      → unchanged (node_modules)
```

### `cleanOutputDirectory`

Clean the output directory before transpilation.

> **Note**: This function is exported from the JavaScript module but not included in the TypeScript definitions.
```javascript
import { cleanOutputDirectory } from '@gasket/cjs';

// Remove entire output directory
cleanOutputDirectory('./cjs');
```
