# `@gasket/plugin-jest`

## 7.5.8

### Patch Changes

- 217acaa: React 19 & NextJS 16

## 7.5.7

### Patch Changes

- db09b09: Improve JSDocs

## 7.5.6

### Patch Changes

- 38c31a9: Dependency updates

## 7.5.5

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.5.4

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.5.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.5.2

### Patch Changes

- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag

## 7.5.1

### Patch Changes

- 388c23f: Updates to allow dynamically generating scripts and commands for npm, yarn, and pnpm instead of being hardcoded to specific package managers.

## 7.5.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.4.2

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.4.1

### Patch Changes

- ea983c6: Adjust peer dep ranges for next and react versions

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.2

### Patch Changes

- 721e8ad: Bump next.js version to latest patch to mitigate critical vulnerability.

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.0

- Aligned version releases across all packages

## 7.0.10

- opt for type:module in TS API app test suite ([#966])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.45.2

- Tune `devDeps` ([#670])

## 6.38.1

- Fix testURL deprecation warning ([#552])

## 6.35.0

- Upgrade @testing-library/react v13 ([#463])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.17.1

- Update glob path from `__dirname` ([#337])

## 6.16.0

- Updates to support not generating a .babelrc file when creating new apps ([#334])

## 6.12.0

- Replaced enzyme with React Testing Library. ([#324])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#216], [#247])

## 5.0.0

- Open Source Release
- Move test framework generated content ([#114])

## 1.3.0

- Remove ESLint setup, which should only be handled in the lint-plugin ([#98])

## 1.2.1

- Fix package.json scripts to wrap glob patterns in double-quotes

## 1.2.0

- Align package structure and dependencies

## 1.1.0

- Upgrades to dependencies in create hook.

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#98]: https://github.com/godaddy/gasket/pull/98
[#114]: https://github.com/godaddy/gasket/pull/114
[#216]: https://github.com/godaddy/gasket/pull/216
[#247]: https://github.com/godaddy/gasket/pull/247
[#324]: https://github.com/godaddy/gasket/pull/324
[#334]: https://github.com/godaddy/gasket/pull/334
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#463]: https://github.com/godaddy/gasket/pull/463
[#670]: https://github.com/godaddy/gasket/pull/670
[#966]: https://github.com/godaddy/gasket/pull/966
