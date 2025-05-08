# `@gasket/plugin-git`

## 7.3.4

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/utils@7.3.4

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

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Catch errors & log warning from initializing a git repo that already exists

## 6.40.0

- Use `main` as default branch ([#598])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.18.0

- Added gitignore property to context ([#344])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.0.0

- Open Source Release

## 1.1.0

- Align package structure and dependencies

## 1.0.0

- Separate git setup from core and cli
- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#247]: https://github.com/godaddy/gasket/pull/247
[#344]: https://github.com/godaddy/gasket/pull/344
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#598]: https://github.com/godaddy/gasket/pull/598
