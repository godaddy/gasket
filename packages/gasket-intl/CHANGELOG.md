# `@gasket/intl`

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
