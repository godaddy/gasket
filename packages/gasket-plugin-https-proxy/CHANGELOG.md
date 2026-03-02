# `@gasket/plugin-https-proxy`

## 7.5.1

### Patch Changes

- 788cda7: Lift RequireAtLeastOne type from optional dependency to ensure it is available

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files

## 7.4.2

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- a89a978: Update types for http-proxy

## 7.4.1

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

## 7.3.12

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.11

### Patch Changes

- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag

## 7.3.10

### Patch Changes

- c46c389: Bring back preboot lifecycle with prepare server actions

## 7.3.9

### Patch Changes

- 116aa96: Fix local script watcher

## 7.3.8

### Patch Changes

- c456fba: bump dependencies

## 7.3.7

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli

## 7.3.6

### Patch Changes

- db3bf54: Add CJS transpile to ESM packages

## 7.3.5

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.2

### Patch Changes

- f716c9e: move middleware types to the middleware plugin
- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.0

- Initial implementation ([#982])

[#982]: https://github.com/godaddy/gasket/pull/982
