# `@gasket/plugin-fastify`

## 8.0.0-next.2

### Patch Changes

- 4aaacd0: Update fastify to use v5 and use adapters

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.5.1

### Patch Changes

- db09b09: Improve JSDocs

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

## 7.4.6

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.4.5

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.4.4

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.2

### Patch Changes

- 116aa96: Fix local script watcher

## 7.4.1

### Patch Changes

- c456fba: bump dependencies

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.3.6

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.5

### Patch Changes

- 0ac6483: Fix deprecated app actions to use single instance

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.2

### Patch Changes

- f716c9e: move middleware types to the middleware plugin
- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.1

### Patch Changes

- 4b6d124: Removed accidental test devDep.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.4

- Deprecate and remove the use of the `getFastifyApp` action ([#1011])

## 7.1.0

- Aligned version releases across all packages

## 7.0.13

- add conditional file content based on TS ([#972])

## 7.0.12

- remove tsconfig.test from fastify, tune glob ignores ([#969])

## 7.0.3

- Fix `[object Object]` logs in Fastify api apps ([#940])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.46.0

- Add native Gasket trust proxy support to Express config ([#675])

## 6.41.1

- Align docs on configuring middleware paths ([#613])

## 6.38.2

- Add generated Fastify starter routes file ([#555])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.33.1

- Fix ability to use async `middleware` hooks ([#444])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.5

- Filter falsy middleware ([#255])

## 6.0.1

- Fix to add `res.locals` for attaching data ([#250])

## 6.0.0

Enable middleware support ([#172])

- Add `middie@5` as dependency
- Register `middie` to enable Fastify middleware

## 5.0.0

- Open Source Release

## 1.0.0

- [#88] Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#88]: https://github.com/godaddy/gasket/pull/88
[#172]: https://github.com/godaddy/gasket/pull/172
[#250]: https://github.com/godaddy/gasket/pull/250
[#255]: https://github.com/godaddy/gasket/pull/255
[#311]: https://github.com/godaddy/gasket/pull/311
[#436]: https://github.com/godaddy/gasket/pull/436
[#444]: https://github.com/godaddy/gasket/pull/444
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#555]: https://github.com/godaddy/gasket/pull/555
[#613]: https://github.com/godaddy/gasket/pull/613
[#675]: https://github.com/godaddy/gasket/pull/675
[#940]: https://github.com/godaddy/gasket/pull/940
[#969]: https://github.com/godaddy/gasket/pull/969
[#972]: https://github.com/godaddy/gasket/pull/972
[#1011]: https://github.com/godaddy/gasket/pull/1011
