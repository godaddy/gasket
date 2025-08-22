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
