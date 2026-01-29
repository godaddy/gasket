# `@gasket/plugin-swagger`

## 8.0.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- 63868e0: remove presets and related docs
- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports

## 8.0.0-next.1

### Patch Changes

- 63868e0: remove presets and related docs
- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.0

### Minor Changes

- 9b1bb5b: ESM port

## 7.3.11

### Patch Changes

- 411f815: Add build script guidance to swagger docs

## 7.3.10

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.9

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.8

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.7

### Patch Changes

- 116aa96: Fix local script watcher

## 7.3.6

### Patch Changes

- c456fba: bump dependencies

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

## 7.2.2

- Update swagger config to include routes plugin ([#1023])

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add prompt for use in presets ([#850])
- Add plugin import to gasket file ([#736])
- Add itself to the app package file

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.31.0

- Support fastify ([#404])

## 6.11.2

- Use fs.promises ([#319])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.7.0

- Added timing to express lifecycle ([#294])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.10.0

- Added check for swagger.json file, with warning/error messaging if not found. ([#186])

## 5.9.0

- Created and integrated Gasket API Preset ([#181])

## 5.8.0

- Initial release. ([#177])

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#177]: https://github.com/godaddy/gasket/pull/177
[#181]: https://github.com/godaddy/gasket/pull/181
[#186]: https://github.com/godaddy/gasket/pull/186
[#247]: https://github.com/godaddy/gasket/pull/247
[#294]: https://github.com/godaddy/gasket/pull/294
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#404]: https://github.com/godaddy/gasket/pull/404
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
[#736]: https://github.com/godaddy/gasket/pull/736
[#850]: https://github.com/godaddy/gasket/pull/850
[#1023]: https://github.com/godaddy/gasket/pull/1023
