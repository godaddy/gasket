# `@gasket/plugin-elastic-apm`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- Updated dependencies [b235fc1]
  - @gasket/request@8.0.0-next.0

## 7.5.1

### Patch Changes

- Updated dependencies [db09b09]
  - @gasket/request@7.5.5

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- @gasket/request@7.5.4

## 7.4.9

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/request@7.5.4

## 7.4.8

### Patch Changes

- Updated dependencies [f2ff987]
  - @gasket/request@7.5.3

## 7.4.7

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/request@7.5.2

## 7.4.6

### Patch Changes

- Updated dependencies [84fd13d]
  - @gasket/request@7.5.1

## 7.4.5

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/request@7.5.0

## 7.4.4

### Patch Changes

- Updated dependencies [8a7d6d7]
  - @gasket/request@7.4.4

## 7.4.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/request@7.4.3

## 7.4.2

### Patch Changes

- Updated dependencies [9a98fd0]
  - @gasket/request@7.4.2

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

## 7.3.7

### Patch Changes

- Updated dependencies [63ba7ba]
- Updated dependencies [63ba7ba]
  - @gasket/request@7.3.6

## 7.3.6

### Patch Changes

- bb11ab9: Fix to only exec apmTransaction lifecycle once per request

## 7.3.5

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli

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
