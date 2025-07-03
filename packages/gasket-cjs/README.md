# gasket-cjs

Utility for transpiling ESM to CJS with .cjs extensions

## Installation

```bash
pnpm install gasket-cjs
```

## Usage

### CLI

```bash
# Transpile from ./lib to ./cjs (default)
gasket-cjs

# Transpile from custom source directory
gasket-cjs ./src

# Transpile to custom output directory
gasket-cjs ./src ./dist/cjs
```

### Programmatic API

```javascript
import { transpile } from 'gasket-cjs';

// Basic usage
const result = await transpile('./src', './cjs');

// With options
const result = await transpile('./src', './cjs', {
  extensions: ['.js', '.mjs', '.ts'],
  createPackageJson: true,
  onProgress: ({ file, current, total }) => {
    console.log(`Processing ${file} (${current}/${total})`);
  }
});

console.log(`Transpiled ${result.successful.length} files`);
```

## Configuration

The utility uses SWC for transpilation with the following default configuration:

- **Module type**: CommonJS
- **Target**: ES2020
- **Extensions**: `.js`, `.mjs`
- **Output extension**: `.cjs`

## Features

- ✅ Transpiles ESM to CJS using SWC
- ✅ Changes file extensions from `.js`/`.mjs` to `.cjs`
- ✅ Fixes import paths to use `.cjs` extensions
- ✅ Creates `package.json` in output directory
- ✅ Preserves directory structure
- ✅ CLI and programmatic interfaces
- ✅ Progress reporting
- ✅ TypeScript definitions

## API Reference

### `transpile(sourceDir, outputDir, options)`

Main transpilation function.

#### Parameters

- `sourceDir` (string): Source directory path
- `outputDir` (string, optional): Output directory path (default: 'cjs')
- `options` (object, optional): Configuration options

#### Options

- `swcConfig` (object): Custom SWC configuration
- `extensions` (string[]): File extensions to process (default: ['.js', '.mjs'])
- `createPackageJson` (boolean): Create package.json in output dir (default: true)
- `onProgress` (function): Progress callback function

#### Returns

Promise resolving to TranspileSummary object:

```javascript
{
  successful: TranspileResult[],
  failed: TranspileResult[],
  total: number,
  outputDir: string
}
```

## License

[MIT licensed](./LICENSE.md).