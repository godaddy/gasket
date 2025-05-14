# `@gasket/plugin-elastic-apm`

## 7.3.4

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/request@7.3.5

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/request@7.3.4

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/request@7.3.3

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 24fa417: Updated documentation around dotenv and imports
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/request@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/request@7.3.0

## 7.1.0

- Use normalized GasketRequest ([#973])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.46.5

- Fix bug with express middleware injection when APM is not available ([#708])

## 6.46.4

- Fix to handle case when APM is not available ([#697])

## 6.46.2

- Ensure consistent apm instance ([#692])

## 6.45.2

- Remove `eslint-plugin-mocha` ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest, update test methods to canonical names ([#457])

## 6.31.1

- Syntax error fix for node@14 support ([#407])

## 6.30.0

- Add an `apmTransaction` lifecycle ([#400])

## 6.27.1

- Skip preboot lifecycle when app is run locally ([#388])

## 6.25.0

- Prefer `--require` for starting Elastic APM ([#378])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.12

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#311]: https://github.com/godaddy/gasket/pull/311
[#378]: https://github.com/godaddy/gasket/pull/378
[#388]: https://github.com/godaddy/gasket/pull/388
[#400]: https://github.com/godaddy/gasket/pull/400
[#407]: https://github.com/godaddy/gasket/pull/407
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#692]: https://github.com/godaddy/gasket/pull/692
[#697]: https://github.com/godaddy/gasket/pull/697
[#708]: https://github.com/godaddy/gasket/pull/708
[#973]: https://github.com/godaddy/gasket/pull/973
