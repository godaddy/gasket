# `@gasket/plugin-vitest`

## 7.2.3

### Patch Changes

- 680f916: Remove the `build:watch` script from these 20 packages. Each one's `build` script runs `gasket-cjs`, and `build:watch` was `pnpm run build --watch` — but `gasket-cjs` (a Commander CLI) has no `--watch` support and exits with `error: unknown option '--watch'` on every invocation. The script has never worked since these packages moved to `gasket-cjs`; removing it rather than reintroducing watch mode, since no consumer of `gasket-cjs` currently supports it (tracked in PFX-1184, same root cause fixed for the internal fork's equivalent packages in gdcorp-uxp/gasket#2298).

## 7.2.2

### Patch Changes

- ee86f4a: Upgrade express version

## 7.2.1

### Patch Changes

- fdd8860: Avoid **dirname and **filename const names

## 7.2.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files

## 7.1.2

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples

## 7.1.1

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.1.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

## 7.0.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.0.2

### Patch Changes

- 116aa96: Fix local script watcher

## 7.0.1

### Patch Changes

- c456fba: bump dependencies

## 7.0.0

### Major Changes

- 30833cb: initial create of vitest plugin
