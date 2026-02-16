# `@gasket/plugin-dynamic-plugins`

## 7.5.1

### Patch Changes

- fdd8860: Avoid **dirname and **filename const names

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files

## 7.4.2

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples

## 7.4.1

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

## 7.3.8

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

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

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### 7.2.3

- Add to config during create ([#1010])

## 7.2.0

- Set timing before commands plugins to allow dynamic plugins to register commands ([#1016])
- Add 'deduped' trace for improved lifecycle debugging
- Invoke prepare lifecycle of dynamic plugins

## 7.1.5

- Export default for type module pkg ([#1015])

## 7.1.0

- Initial release ([#970], [#991]).

[#970]: https://github.com/godaddy/gasket/pull/970
[#991]: https://github.com/godaddy/gasket/pull/991
[#1010]: https://github.com/godaddy/gasket/pull/1010
[#1015]: https://github.com/godaddy/gasket/pull/1015
[#1016]: https://github.com/godaddy/gasket/pull/1016
