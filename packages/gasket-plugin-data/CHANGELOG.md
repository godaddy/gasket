# `@gasket/plugin-data`

## 7.3.5

### Patch Changes

- a5cd008: make configure hook sync

## 7.3.4

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/request@7.3.5
  - @gasket/utils@7.3.4

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/request@7.3.4
  - @gasket/utils@7.3.3

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/request@7.3.3
  - @gasket/utils@7.3.2

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/request@7.3.1
  - @gasket/utils@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/request@7.3.0
  - @gasket/utils@7.3.0

## 7.1.0

- Use normalized GasketRequest ([#973])
- Improvements to gasket command setup ([#989])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file
- Added `getGasketData` and `getPublicGasketData` actions ([#773])
- Lifecycles are now `gasketData` and `publicGasketData`
- No magic file imports

## 6.45.2

- Add `cross-env`, adjust test script, remove `eslint-plugin-mocha`, refactor test ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])
- Avoid potential overwriting of custom config state

## 6.20.4

- More descriptive error handling for hooks that do not return results ([#359])

## 6.20.0

- Use `applyConfigOverrides` to allow command overrides in app config ([#348])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])
-

## 6.0.0

- Allow `public` app config to be available via `@gasket/data` ([#231])

## 5.0.0

- Open Source Release

## 1.2.0

- Align package structure and dependencies

## 1.1.2

- Migrated to monorepo

## 1.1.1

- Fix timing bug in relation to `@gasket/redux-plugin`.

## 1.1.0

- Add support for specifying app config in single file.

## 1.0.1

- Move config to preboot phase.

## 1.0.0

- Initial implementation.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#231]: https://github.com/godaddy/gasket/pull/231
[#311]: https://github.com/godaddy/gasket/pull/311
[#348]: https://github.com/godaddy/gasket/pull/348
[#359]: https://github.com/godaddy/gasket/pull/359
[#436]: https://github.com/godaddy/gasket/pull/436
[#460]: https://github.com/godaddy/gasket/pull/460
[#670]: https://github.com/godaddy/gasket/pull/670
[#736]: https://github.com/godaddy/gasket/pull/736
[#773]: https://github.com/godaddy/gasket/pull/773
[#973]: https://github.com/godaddy/gasket/pull/973
[#989]: https://github.com/godaddy/gasket/pull/989
