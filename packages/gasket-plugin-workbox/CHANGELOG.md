# `@gasket/plugin-workbox`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.0

### Minor Changes

- 016e0da: Deprecate service worker and workbox packages

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.6

### Patch Changes

- 5d38a2e: Eslint version 9

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
- Removed deprecated assetPrefix config support ([#661])

## 6.45.2

- Tune `devDeps`, update test script ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.30.0

- Support fastify ([#397])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.10

- Safer base path config selection ([#266])
  - Deprecate assetPrefix in favor of `basePath` config property

## 6.0.0

- Change `zone` config to `basePath` ([#212])
- Pass new `composeServiceWorker` context through to `workbox` lifecycle ([#217])
- Upgraded dev dependencies ([#247])

## 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

## 5.0.0

- Open Source Release

## 1.1.1

- Get library version from `workbox-build` package.json ([#95])

## 1.1.0

- Align package structure and dependencies

## 1.0.1

- Migrated to monorepo

## 1.0.0

- Initial implementation.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#95]: https://github.com/godaddy/gasket/pull/95
[#166]: https://github.com/godaddy/gasket/pull/166
[#212]: https://github.com/godaddy/gasket/pull/212
[#217]: https://github.com/godaddy/gasket/pull/217
[#247]: https://github.com/godaddy/gasket/pull/247
[#266]: https://github.com/godaddy/gasket/pull/266
[#311]: https://github.com/godaddy/gasket/pull/311
[#397]: https://github.com/godaddy/gasket/pull/397
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#661]: https://github.com/godaddy/gasket/pull/661
[#670]: https://github.com/godaddy/gasket/pull/670
