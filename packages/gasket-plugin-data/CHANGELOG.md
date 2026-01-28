# `@gasket/plugin-data`

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports
- Updated dependencies [63868e0]
- Updated dependencies [ed9a857]
- Updated dependencies [d99ffaf]
- Updated dependencies [ed9a857]
  - @gasket/request@8.0.0-next.1
  - @gasket/utils@8.0.0-next.1

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- Updated dependencies [b235fc1]
  - @gasket/request@8.0.0-next.0
  - @gasket/utils@8.0.0-next.0

## 7.5.1

### Patch Changes

- Updated dependencies [db09b09]
  - @gasket/request@7.5.5
  - @gasket/utils@7.6.4

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- @gasket/request@7.5.4
- @gasket/utils@7.6.3

## 7.4.12

### Patch Changes

- f3a6bf4: Update docs with gasket data vs gasket config

## 7.4.11

### Patch Changes

- 3d3fdb0: Fix getPublicGasketData caching

## 7.4.10

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/request@7.5.4
  - @gasket/utils@7.6.3

## 7.4.9

### Patch Changes

- Updated dependencies [f2ff987]
  - @gasket/request@7.5.3
  - @gasket/utils@7.6.2

## 7.4.8

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/request@7.5.2
  - @gasket/utils@7.6.1

## 7.4.7

### Patch Changes

- Updated dependencies [84fd13d]
  - @gasket/request@7.5.1

## 7.4.6

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/request@7.5.0
  - @gasket/utils@7.6.0

## 7.4.5

### Patch Changes

- Updated dependencies [06999d5]
  - @gasket/utils@7.5.0
  - @gasket/request@7.4.4

## 7.4.4

### Patch Changes

- Updated dependencies [8a7d6d7]
  - @gasket/request@7.4.4

## 7.4.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/request@7.4.3
  - @gasket/utils@7.4.2

## 7.4.2

### Patch Changes

- Updated dependencies [9a98fd0]
  - @gasket/request@7.4.2
  - @gasket/utils@7.4.1

## 7.4.1

### Patch Changes

- Updated dependencies [39e41cb]
  - @gasket/request@7.4.1

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/request@7.4.0
  - @gasket/utils@7.4.0

## 7.3.7

### Patch Changes

- Updated dependencies [63ba7ba]
- Updated dependencies [63ba7ba]
  - @gasket/request@7.3.6
  - @gasket/utils@7.3.5

## 7.3.6

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli

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
