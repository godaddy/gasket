# `@gasket/intl`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.5.3

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- 9d86fd2: Updated documentation
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples

## 7.5.2

### Patch Changes

- f2ff987: Tune eslint9 configs
- f2ddbdc: Fix to refresh messages after load

## 7.5.1

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.5.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

## 7.4.0

### Minor Changes

- 328d71a: Refactored the IntlManager class to separate public and internal APIs:
  - Created a public IntlManager class that exposes only the necessary methods and properties
  - Moved internal implementation details to InternalIntlManager
  - Updated type definitions to reflect the new structure
  - Improved documentation in README.md with more examples and API details

## 7.3.6

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli

## 7.3.5

### Patch Changes

- db3bf54: Add CJS transpile to ESM packages

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

## 6.46.4

- Fix for missing manifest paths ([#701])

## 6.45.2

- Remove `setup-env` ([#670])
- Support server-side debug logging under `debug` namespace `gasket:helper:intl`

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.34.0

- Add support for contextual thunk for locales path ([#447])

## 6.26.1

- Fix `LocaleStatus` enum to match to JS ([#383])

## 6.7.1

- Adjust fallback strategy
- Added missing test dependency for assume-sinon

## 6.0.14

- Added check for locales config to determine fallbackLocale. ([#276])

## 6.0.11

- Fixed localePath manifest lookup ([#268])

## 6.0.6

- Expose server variant of LocaleUtils to avoid bundling serverLoadData method ([#256])

## 6.0.0

- Initial release

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#256]: https://github.com/godaddy/gasket/pull/256
[#268]: https://github.com/godaddy/gasket/pull/268
[#276]: https://github.com/godaddy/gasket/pull/276
[#383]: https://github.com/godaddy/gasket/pull/383
[#436]: https://github.com/godaddy/gasket/pull/436
[#447]: https://github.com/godaddy/gasket/pull/447
[#442]: https://github.com/godaddy/gasket/pull/442
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
[#670]: https://github.com/godaddy/gasket/pull/670
[#701]: https://github.com/godaddy/gasket/pull/701
