# `@gasket/utils`

## 8.0.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- ed9a857: ESM only exports

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- ed9a857: ESM only exports

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.6.4

### Patch Changes

- db09b09: Improve JSDocs

## 7.6.3

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples

## 7.6.2

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.6.1

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.6.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

## 7.5.0

### Minor Changes

- 06999d5: Convert gasket-utils to ESM with CommonJS compatibility

## 7.4.2

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.1

### Patch Changes

- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.3.5

### Patch Changes

- 63ba7ba: Adjustments to types

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

## 7.2.2

- Fix type of environment overrides ([#1026])

## 7.1.2

- Ensure non-plain objects are copied instead of merge ([#1002])

## 7.1.0

- Aligned version releases across all packages

- Adjustments to support Gasket in edge runtime ([#961])
  - Add config export for leaner applyConfigOverrides
  - Use `deepmerge` instead of `lodash.defaultsdeep` due to incompatible _new Function_

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Added getPackageLastestVersion util function ([#768])
- Removed `requireWithInstall` to encourage import patterns with ESM
- Removed support for deprecated `--npmconfig` flag ([#647])

## 6.41.0

- Add diagnostic logging for environment/config resolution when a `DEBUG=gasket:*` environment variable is set ([#607])

## 6.36.0

- force install with npm ([#496])

## 6.35.2

- add requireWithInstall & tryResolve utils ([#492])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.20.0

- Add `applyConfigOverrides` to allow command overrides in config ([#348])
  - Deprecates `applyEnvironmentOverrides` for improved API

## 6.15.0

- Support for AbortController with `runShellCommand` ([#331])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.3.0

- Fixed issue where an `environments` section of config files was doing proper inheritance of dev environment settings for the `local` environment.

## 6.0.13

- Added --legacy-peer-deps flag to install cli. ([#275])

## 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

## 5.1.1

- Fix missing dependency

## 5.1.0

- Move and expose PackageManager from `@gasket/cli` ([#143])
  - Align tests to Mocha suite

## 5.0.0

- Open Source Release

## 1.2.0

- Align package structure and dependencies

## 1.1.0

- Adds functions:
  - `runShellCommand`

## 1.0.0

- Initial implementation. Adds:
  - `tryRequire`
  - `applyEnvironmentOverrides`

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#143]: https://github.com/godaddy/gasket/pull/143
[#247]: https://github.com/godaddy/gasket/pull/247
[#275]: https://github.com/godaddy/gasket/pull/275
[#311]: https://github.com/godaddy/gasket/pull/311
[#331]: https://github.com/godaddy/gasket/pull/331
[#348]: https://github.com/godaddy/gasket/pull/348
[#436]: https://github.com/godaddy/gasket/pull/436
[#492]: https://github.com/godaddy/gasket/pull/492
[#496]: https://github.com/godaddy/gasket/pull/496
[#607]: https://github.com/godaddy/gasket/pull/607
[#647]: https://github.com/godaddy/gasket/pull/647
[#768]: https://github.com/godaddy/gasket/pull/768
[#961]: https://github.com/godaddy/gasket/pull/961
[#1002]: https://github.com/godaddy/gasket/pull/1002
