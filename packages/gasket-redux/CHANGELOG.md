# `@gasket/redux`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.0

### Minor Changes

- 9b1bb5b: ESM port

### Patch Changes

- dd11e2c: Mark as deprecated

## 7.3.7

### Patch Changes

- f2ff987: Tune eslint9 configs

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

## 7.2.2

- Update redux peer dependencies ([#1027])

## 7.1.0

- Aligned version releases across all packages

## 7.0.14

- Add configureMakeStore options callback to allow for per-request configuration ([#974])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Update placeholder reducer from `config` -> `gasketData` ([#693])

## 6.45.2

- Tune `devDeps`, update test script ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.0.8

- Add default placeholder for `config` in the initial state ([#261])

## 6.0.7

- Provide `getOrCreateStore` for finding existing store on a context ([#259])

## 6.0.0

- Support for adding an entry root reducer ([#173])
- No longer provid a default make-store ([#173])
- Upgraded dev dependencies ([#247])

## 5.0.0

- Open Source Release

## 3.2.1

- Fix package.json scripts to wrap glob patterns in double-quotes

## 3.2.0

- Add support to customize thunk middleware ([#80])

## 3.1.0

- Align package structure and dependencies

## 3.0.1

- Fix placeholder reducers should never return undefined
- Fixed make-store export

## 3.0.0

- Move to monorepo
- Removed default reducers to be specified by apps
- Removed `@redux-dynostore` dependency
- Removed React dependencies and `withReducers` component.

## 2.1.3

- Use shallow merging strategy for dynamic reducer state

## 2.1.2

- Support `redux@4`

## 2.1.0

- Set logging to false by default

## 2.0.2

- Upgrading and aligning dependencies

## 2.0.1

- Adding an option `logging` to configureMakeStore call, to enable or disable redux logger

## 2.0.0

- Upgraded to Babel 7 and the `@babel/` namespace packages.
- Upgraded to latest `@gasket/*` packages that received the same update.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#80]: https://github.com/godaddy/gasket/pull/80
[#173]: https://github.com/godaddy/gasket/pull/173
[#247]: https://github.com/godaddy/gasket/pull/247
[#259]: https://github.com/godaddy/gasket/pull/259
[#261]: https://github.com/godaddy/gasket/pull/261
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#693]: https://github.com/godaddy/gasket/pull/693
[#974]: https://github.com/godaddy/gasket/pull/974
[#1027]: https://github.com/godaddy/gasket/pull/1027
