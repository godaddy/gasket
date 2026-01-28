# `@gasket/plugin-express`

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

## 7.4.4

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.4.3

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.4.2

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.1

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.3.5

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.4

### Patch Changes

- 0ac6483: Fix deprecated app actions to use single instance

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

## 7.1.4

- Deprecate and remove the use of the `getExpressApp` action ([#1011])

## 7.1.3

- Adjust cookie parser invocation to earlier in the lifecycle chain ([#1009])

## 7.1.1

- Ensure cookies are parsed ([#1001])

## 7.1.0

- Aligned version releases across all packages

## 7.0.14

- Switch to `http2-express` to address vulnerabilities ([#959])

## 7.0.12

- remove tsconfig.test from fastify, tune glob ignores ([#969])

## 7.0.11

- opt for js jest config ([#967])

## 7.0.10

- opt for type:module in TS API app test suite ([#966])

## 7.0.8

- Relocated express require inside getExpressApp ([#958])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Plugin is `typescript` aware ([#736])
- Add `index.ts` generator file
- Add plugin import to gasket file
- Add itself to the app package file
- Add files and file imports based on the `typescript` context

## 6.46.5

- Support the case of middleware hooks returning empty arrays ([#708])

## 6.46.4

- Adjust JSDocs and TS types ([#695])

## 6.46.0

- Add native Gasket trust proxy support to Express config ([#675])

## 6.45.2

- Remove obsolete `devDeps` ([#670])

## 6.44.0

- Documentation & type fixes ([#637])
  - Add missing type definition for `routes` config property
  - Add `middlewareInclusionRegex` config property, deprecating `excludedRoutesRegex`

## 6.41.2

- Fix ordering of error middlewares so they come after API routes
- Docs on configuring middleware paths ([#613])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.33.1

- Fix ability to use async `middleware` hooks ([#444])

## 6.17.1

- Update glob path from `__dirname` ([#337])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.5.0

- Add support for using http2 servers ([#287])

## 6.0.5

- Filter falsy middleware ([#255])

## 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

## 5.9.0

- Created and integrated Gasket API Preset ([#181])

## 5.0.0

- Open Source Release

## 2.1.0

- Align package structure and dependencies

## 2.0.0

- Dismantling core-plugin ([#23])

## 1.0.0

- Renaming express-create to expressCreate
- Separate express plugins from core
- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#23]: https://github.com/godaddy/gasket/pull/23
[#181]: https://github.com/godaddy/gasket/pull/181
[#247]: https://github.com/godaddy/gasket/pull/247
[#255]: https://github.com/godaddy/gasket/pull/255
[#287]: https://github.com/godaddy/gasket/pull/287
[#311]: https://github.com/godaddy/gasket/pull/311
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#444]: https://github.com/godaddy/gasket/pull/444
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#613]: https://github.com/godaddy/gasket/pull/613
[#637]: https://github.com/godaddy/gasket/pull/637
[#670]: https://github.com/godaddy/gasket/pull/670
[#675]: https://github.com/godaddy/gasket/pull/675
[#695]: https://github.com/godaddy/gasket/pull/695
[#708]: https://github.com/godaddy/gasket/pull/708
[#736]: https://github.com/godaddy/gasket/pull/736
[#958]: https://github.com/godaddy/gasket/pull/958
[#966]: https://github.com/godaddy/gasket/pull/966
[#967]: https://github.com/godaddy/gasket/pull/967
[#959]: https://github.com/godaddy/gasket/pull/959
[#969]: https://github.com/godaddy/gasket/pull/969
[#1001]: https://github.com/godaddy/gasket/pull/1001
[#1009]: https://github.com/godaddy/gasket/pull/1009
[#1011]: https://github.com/godaddy/gasket/pull/1011
