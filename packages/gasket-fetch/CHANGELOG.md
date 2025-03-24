# `@gasket/fetch`

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

## 6.45.2

- Remove `setup-env` ([#670])

## 6.34.3

- Upgrade mocha v10 ([#442])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

## 6.34.2

- Upgrade jsdom to v20 ([#440])

## 6.28.1

- Update TS types, remove test case ([#394])

## 6.24.2

- Use wrapper to call through to window.fetch in browser ([#372])

## 6.0.0

- Replace cross-fetch with native implementation. ([#176])

## 5.6.0

- Updating version of cross-fetch to 3.0.4 ([#164])

## 5.0.0

- Open Source Release

## 1.0.1

- Migrated to monorepo

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#164]: https://github.com/godaddy/gasket/pull/164
[#176]: https://github.com/godaddy/gasket/pull/176
[#372]: https://github.com/godaddy/gasket/pull/372
[#394]: https://github.com/godaddy/gasket/pull/394
[#440]: https://github.com/godaddy/gasket/pull/440
[#442]: https://github.com/godaddy/gasket/pull/442
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
[#670]: https://github.com/godaddy/gasket/pull/670
