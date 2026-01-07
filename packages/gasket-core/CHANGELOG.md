# `@gasket/core`

## 7.7.2

### Patch Changes

- 31bf06b: Upgrade glob (v8→v13) and rimraf (v3→v6) dependencies.
  - @gasket/utils@7.6.4

## 7.7.1

### Patch Changes

- db09b09: Improve JSDocs
- Updated dependencies [db09b09]
  - @gasket/utils@7.6.4

## 7.7.0

### Minor Changes

- 97b32ad: Ability to set Gasket env programmatically

### Patch Changes

- @gasket/utils@7.6.3

## 7.6.3

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/utils@7.6.3

## 7.6.2

### Patch Changes

- f2ff987: Tune eslint9 configs
- Updated dependencies [f2ff987]
  - @gasket/utils@7.6.2

## 7.6.1

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/utils@7.6.1

## 7.6.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/utils@7.6.0

## 7.5.3

### Patch Changes

- Updated dependencies [06999d5]
  - @gasket/utils@7.5.0

## 7.5.2

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/utils@7.4.2

## 7.5.1

### Patch Changes

- 39a8007: Adjust gasket.symbol type and docs
- Updated dependencies [9a98fd0]
  - @gasket/utils@7.4.1

## 7.5.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/utils@7.4.0

## 7.4.2

### Patch Changes

- 63ba7ba: Fix to not import from node module package
- Updated dependencies [63ba7ba]
  - @gasket/utils@7.3.5

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
