# `@gasket/plugin-metadata`

## 7.5.10

### Patch Changes

- ee86f4a: Upgrade express version
- Updated dependencies [ee86f4a]
  - @gasket/core@7.7.4
  - @gasket/plugin-logger@7.4.0

## 7.5.9

### Patch Changes

- @gasket/plugin-logger@7.4.0
- @gasket/core@7.7.3

## 7.5.8

### Patch Changes

- Updated dependencies [31bf06b]
  - @gasket/core@7.7.2
  - @gasket/plugin-logger@7.4.0

## 7.5.7

### Patch Changes

- Updated dependencies [db09b09]
  - @gasket/core@7.7.1
  - @gasket/plugin-logger@7.4.0

## 7.5.6

### Patch Changes

- Updated dependencies [97b32ad]
  - @gasket/core@7.7.0
  - @gasket/plugin-logger@7.4.0

## 7.5.5

### Patch Changes

- Updated dependencies [7d1d8bf]
- Updated dependencies [9b1bb5b]
  - @gasket/plugin-logger@7.4.0
  - @gasket/core@7.6.3

## 7.5.4

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/plugin-logger@7.3.8
  - @gasket/core@7.6.3

## 7.5.3

### Patch Changes

- Updated dependencies [f2ff987]
  - @gasket/plugin-logger@7.3.7
  - @gasket/core@7.6.2

## 7.5.2

### Patch Changes

- c3ff29f: Fix to not load devDeps of plugins and use gasket.logger
- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/plugin-logger@7.3.6
  - @gasket/core@7.6.1

## 7.5.1

### Patch Changes

- 696b43f: Fix missing modules on docs site, upgrade docusaurus, remove require from metadata plugin, remove lifecycle graphs
  - @gasket/plugin-logger@7.3.5
  - @gasket/core@7.6.0

## 7.5.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/core@7.6.0
  - @gasket/plugin-logger@7.3.5

## 7.4.5

### Patch Changes

- @gasket/core@7.5.3
- @gasket/plugin-logger@7.3.5

## 7.4.4

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/plugin-logger@7.3.5
  - @gasket/core@7.5.2

## 7.4.3

### Patch Changes

- Updated dependencies [39a8007]
  - @gasket/core@7.5.1
  - @gasket/plugin-logger@7.3.4

## 7.4.2

### Patch Changes

- 116aa96: Fix local script watcher
  - @gasket/core@7.5.0
  - @gasket/plugin-logger@7.3.4

## 7.4.1

### Patch Changes

- c456fba: bump dependencies
  - @gasket/core@7.5.0
  - @gasket/plugin-logger@7.3.4

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/core@7.5.0
  - @gasket/plugin-logger@7.3.4

## 7.3.12

### Patch Changes

- Updated dependencies [63ba7ba]
  - @gasket/core@7.4.2
  - @gasket/plugin-logger@7.3.4

## 7.3.11

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli
  - @gasket/core@7.4.1
  - @gasket/plugin-logger@7.3.4

## 7.3.10

### Patch Changes

- db3bf54: Add CJS transpile to ESM packages
  - @gasket/core@7.4.1
  - @gasket/plugin-logger@7.3.4

## 7.3.9

### Patch Changes

- 4f08df2: Fix to create require in all places
  - @gasket/core@7.4.1
  - @gasket/plugin-logger@7.3.4

## 7.3.8

### Patch Changes

- 6cf18c2: Fix to create require
  - @gasket/core@7.4.1
  - @gasket/plugin-logger@7.3.4

## 7.3.7

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/plugin-logger@7.3.4
  - @gasket/core@7.4.1

## 7.3.6

### Patch Changes

- Updated dependencies [8e774bb]
  - @gasket/core@7.4.0
  - @gasket/plugin-logger@7.3.3

## 7.3.5

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-logger@7.3.3
  - @gasket/core@7.3.3

## 7.3.4

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-logger@7.3.2
  - @gasket/core@7.3.2

## 7.3.3

### Patch Changes

- a02ebdc: Export DetailData type.

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-logger@7.3.1
  - @gasket/core@7.3.1

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports
  - @gasket/plugin-logger@7.3.0

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-logger@7.3.0
  - @gasket/core@7.3.0

### 7.2.3

- Add plugin as a dev dependency in create ([#1034])

## 7.2.1

- Fix to use gasket.metadata from package.json for modules ([#1022])

## 7.1.0

- Convert plugin to ESM ([#978])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.46.4

- Adjust JSDocs and TS types ([#695])

## 6.41.1

- Docs on accessing `gasket.metadata` ([#613])

## 6.39.2

- Add missing `ConfigurationsData` type ([#597])

## 6.36.0

- Add missing `configurations` property to plugin metadata type ([#498])

## 6.35.0

- Fix package object type ([#489])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.1.0

- Clean markdown from jsdocs ([#141])

## 5.0.0

- Open Source Release

## 2.0.0

- Allow presets to define metadata
- Metadata is assigned to gasket instance, and only by this plugin ([#64])
  - Uses [Loader] from Gasket instance to get [PluginInfo] and [PresetInfo] data
  - `gasket.metadata` structure matches loaded infos with functions redacted
- Load [ModuleInfo] for main app

## 1.0.0

- [#51] Initial implementation
  - Adds `package.json` and hooks to each `gasket.config.metadata`
  - Implements the `metadata` lifecycle

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#51]: https://github.com/godaddy/gasket/pull/51
[#64]: https://github.com/godaddy/gasket/pull/64
[#141]: https://github.com/godaddy/gasket/pull/141
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#489]: https://github.com/godaddy/gasket/pull/489
[#498]: https://github.com/godaddy/gasket/pull/498
[#597]: https://github.com/godaddy/gasket/pull/597
[#613]: https://github.com/godaddy/gasket/pull/613
[#695]: https://github.com/godaddy/gasket/pull/695
[#978]: https://github.com/godaddy/gasket/pull/978
[#1022]: https://github.com/godaddy/gasket/pull/1022
[#1034]: https://github.com/godaddy/gasket/pull/1034
[Loader]: /packages/gasket-resolve/docs/api.md#loader
[PluginInfo]: /packages/gasket-resolve/docs/api.md#plugininfo
[PresetInfo]: /packages/gasket-resolve/docs/api.md#presetinfo
[ModuleInfo]: /packages/gasket-resolve/docs/api.md#moduleinfo
