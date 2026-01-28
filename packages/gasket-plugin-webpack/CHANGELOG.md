# `@gasket/plugin-webpack`

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

## 7.3.9

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.8

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.3.7

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.6

### Patch Changes

- 871b8fe: Add webpack plugin to guard against GASKET_ENV client bundle usage

## 7.3.5

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

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

## 7.0.15

- Fix dynamic require warning ([#985])

## 7.0.7

- Update to `getWebpackConfig` `WebpackContext` param ([#955])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.24.2

- Fix invalid lifecycle names which was causing the lifecycle diagram to get a syntax error. ([#376])

## 6.20.1

- Fix migration links

## 6.19.0

- Deprecating webpack-merge smart approaches ([#346])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.8.2

- Fix lazy require `initWebpack` dependencies ([#303])

## 6.6.0

- Created new webpackConfig lifecycle ([#284])

## 6.0.3

- Install webpack 5 as a dev dependency by default ([#252])

## 6.0.0

- Remove node config defaults to support webpack 5 ([#221])
- Upgraded dev dependencies ([#247])

## 5.0.0

- Open Source Release

## 1.1.1

- Fix package.json scripts to wrap glob patterns in double-quotes

## 1.1.0

- Align package structure and dependencies

## 1.0.1

- Separate webpack plugin from core
- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#221]: https://github.com/godaddy/gasket/pull/221
[#247]: https://github.com/godaddy/gasket/pull/247
[#252]: https://github.com/godaddy/gasket/pull/252
[#284]: https://github.com/godaddy/gasket/pull/284
[#303]: https://github.com/godaddy/gasket/pull/303
[#311]: https://github.com/godaddy/gasket/pull/311
[#376]: https://github.com/godaddy/gasket/pull/376
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#736]: https://github.com/godaddy/gasket/pull/736
[#955]: https://github.com/godaddy/gasket/pull/955
[#985]: https://github.com/godaddy/gasket/pull/985
