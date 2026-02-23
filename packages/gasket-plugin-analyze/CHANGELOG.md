# `@gasket/plugin-analyze`

## 7.4.3

### Patch Changes

- ee86f4a: Upgrade express version

## 7.4.2

### Patch Changes

- 217acaa: React 19 & NextJS 16

## 7.4.1

### Patch Changes

- 18f51cc: Fix return type of webpackConfig hook

## 7.4.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

## 7.3.8

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.7

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.6

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.5

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### 7.2.3

- Update create to use environment config ([#1010])
  - Fix for ANALYZE env var check with support for analyze in Gasket env check

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Remove the custom command and replace it with an npm script that sets an environment variable ([#810])

## 6.46.4

- Adjust JSDocs and TS types ([#695])

## 6.45.2

- Add `cross-env`, adjust test script, remove `eslint-plugin-mocha` ([#670])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.20.3

- Upgrade `webpack-bundle-analyzer` ([#354])

## 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- version alignment
- upgrade dependencies ([#247])

## 5.3.3

- Update webpack-bundle-analyzer@^3.7.0 ([#161])

## 5.0.0

- Open Source Release

## 2.0.0

- Move **analyze** command from CLI to this plugin ([#74])

## 1.2.0

- Align package structure and dependencies

## 1.1.1

- Migrated to monorepo

## 1.1.0

- Use webpack-bundle-analyzer directly.
- Add analyze script in create lifecycle

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#74]: https://github.com/godaddy/gasket/pull/74
[#161]: https://github.com/godaddy/gasket/pull/161
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#347]: https://github.com/godaddy/gasket/pull/347
[#354]: https://github.com/godaddy/gasket/pull/354
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#695]: https://github.com/godaddy/gasket/pull/695
[#810]: https://github.com/godaddy/gasket/pull/810
[#1010]: https://github.com/godaddy/gasket/pull/1010
