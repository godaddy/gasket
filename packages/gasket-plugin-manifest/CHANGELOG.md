# `@gasket/plugin-manifest`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.3.9

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.8

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.7

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.6

### Patch Changes

- 116aa96: Fix local script watcher

## 7.3.5

### Patch Changes

- c456fba: bump dependencies

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

- f716c9e: move middleware types to the middleware plugin
- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.27.1

- Add Fastify hook ([#390])
- extract reusable code into serve.js to be used by both Express/Fastify hooks ([#390])

## 6.11.2

- Use fs.promises ([#319])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Fix to allow basic manifest to work with no config ([#244])
- Fix to remove config-only props from rendering in manifest.json ([#244])
- Ability to configure static output of manifest at build time ([#218])
- Upgraded dev dependencies ([#247])

## 5.0.0

- Open Source Release

## 1.3.0

- Align package structure and dependencies

## 1.2.1

- Migrated to monorepo

## 1.2.0

- Add `manifest.path` config option to allow serving `manifest.json` from a custom path

## 1.1.0

- Use execWaterfall for the manifest lifecycle

## 1.0.1

- Fix forward slash on endpoint

## 1.0.0

- Initial implementation

- Serving `manifest.json`
- Adding a `link` to the document `<head>`
- Adding a new `manifest` lifecycle hook
- Accepting `Manifest` setup in `gasket.js`

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#218]: https://github.com/godaddy/gasket/pull/218
[#244]: https://github.com/godaddy/gasket/pull/244
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#390]: https://github.com/godaddy/gasket/pull/390
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
