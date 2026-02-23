# `@gasket/plugin-docs-graph`

## 7.4.2

### Patch Changes

- ee86f4a: Upgrade express version

## 7.4.1

### Patch Changes

- fdd8860: Avoid **dirname and **filename const names

## 7.4.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

## 7.3.7

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.6

### Patch Changes

- 696b43f: Fix missing modules on docs site, upgrade docusaurus, remove require from metadata plugin, remove lifecycle graphs

## 7.3.5

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.4

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.26.2

- Fix syntax error with the deprecation note in the lifecycle diagram ([#386])

## 6.24.2

- Support showing deprecation for lifecycles ([#376])

## 6.11.2

- Use fs.promises ([#319])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.0.2

- Initial implementation

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#247]: https://github.com/godaddy/gasket/pull/247
[#319]: https://github.com/godaddy/gasket/pull/319
[#376]: https://github.com/godaddy/gasket/pull/376
[#386]: https://github.com/godaddy/gasket/pull/386
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
