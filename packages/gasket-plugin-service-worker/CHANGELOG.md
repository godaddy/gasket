# `@gasket/plugin-service-worker`

## 7.5.1

### Patch Changes

- ee86f4a: Upgrade express version

## 7.5.0

### Minor Changes

- 016e0da: Deprecate service worker and workbox packages

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.4.6

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.4.5

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.4

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.3

### Patch Changes

- 116aa96: Fix local script watcher

## 7.4.2

### Patch Changes

- c456fba: bump dependencies

## 7.4.1

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.4.0

### Minor Changes

- 2b42786: Use swc in place of uglify for minification

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

## 7.1.0

- Improvements to gasket command setup ([#989])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.45.2

- Tune `devDeps`, update test script ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.24.0

- Add Fastify support ([#365])

## 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

## 6.11.2

- Use fs.promises and upgrade mkdirp ([#319])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Ability to configure static output of service workers for build time ([#217])
- Context for `composeServiceWorker` changes for build vs request-based service workers ([#217])

## 5.3.1

- Inject registration script to Webpack entry modules ([#158])

## 5.0.0

- Open Source Release

## 1.3.0

- `serviceWorkerCacheKey` executed in `express` lifecycle ([#95])

## 1.2.0

- Align package structure and dependencies

## 1.1.1

- Migrated to monorepo

## 1.1.0

- Minify composed code in production

## 1.0.0

- Initial implementation.
- Support for caching sw content

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#95]: https://github.com/godaddy/gasket/pull/95
[#158]: https://github.com/godaddy/gasket/pull/158
[#217]: https://github.com/godaddy/gasket/pull/217
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#347]: https://github.com/godaddy/gasket/pull/347
[#365]: https://github.com/godaddy/gasket/pull/365
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#989]: https://github.com/godaddy/gasket/pull/989
