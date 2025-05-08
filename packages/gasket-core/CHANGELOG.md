# `@gasket/core`

## 7.4.1

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/utils@7.3.4

## 7.4.0

### Minor Changes

- 8e774bb: Throw if hooks return promises for sync exec methods

### Patch Changes

- @gasket/utils@7.3.3

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/utils@7.3.3

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/utils@7.3.2

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/utils@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/utils@7.3.0

## 7.2.2

- Fix configuration options so they allow partial environment overrides ([#1026])

## 7.2.0

- Adjust types GasketTrace

## 7.1.0

- Added `registerPlugins` method to the GasketEngine ([#970])
- Edge runtime support using lean export from `@gasket/utils` ([#961])
- Improvements to gasket command setup with async `prepare` lifecycle ([#989])

## 7.0.6

- Fix to include `@gasket/utils` as a dependency ([#949])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#949]: https://github.com/godaddy/gasket/pull/949
[#961]: https://github.com/godaddy/gasket/pull/961
[#970]: https://github.com/godaddy/gasket/pull/970
[#989]: https://github.com/godaddy/gasket/pull/989
