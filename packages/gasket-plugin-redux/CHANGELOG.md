# `@gasket/plugin-redux`

## 7.4.4

### Patch Changes

- ee86f4a: Upgrade express version

## 7.4.3

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.2

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.1

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.1

### Patch Changes

- f716c9e: move middleware types to the middleware plugin
- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.2.2

- Add deprecation notices for redux plugin ([#1027])

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Added flag to disable redux store generation ([#762])
- Use per-request logger
- Remove dependency on `@gasket/plugin-log`

## 6.45.2

- Tune `peerDeps` & `devDeps`, update test script ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

## 6.17.1

- Align glob path pattern ([#337])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Update peer dep versions ([#243])
- Generate a `redux/store.js` with support for adding reducers via plugins ([#173])
- Set `process.env.GASKET_MAKE_STORE_FILE` for shared package imports ([#173])

## 5.0.0

- Open Source Release

## 2.3.0

- Align package structure and dependencies

## 2.2.1

- Fix core requirement regression

## 2.2.0

- Migrated to monorepo
- Upgrade dependencies for create

## 2.1.0

- Remove dependency on deprecated core plugin

## 2.0.2

- Allow `@gasket/plugin-log@3`
- Fix security audit failures

## 2.0.1

- Create with `@gasket/redux@^2.0.0`

## 2.0.0

- Depend on `@gasket/*` 2.0 libraries that have been updated for Next & Babel 7

## 1.1.0

- Ensure `@gasket/redux`, `redux`, and `react-redux` are
  added to dependencies of new apps.

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#173]: https://github.com/godaddy/gasket/pull/173
[#243]: https://github.com/godaddy/gasket/pull/243
[#311]: https://github.com/godaddy/gasket/pull/311
[#337]: https://github.com/godaddy/gasket/pull/337
[#347]: https://github.com/godaddy/gasket/pull/347
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#762]: https://github.com/godaddy/gasket/pull/762
[#1027]: https://github.com/godaddy/gasket/pull/1027
