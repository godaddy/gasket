# `@gasket/plugin-command`

## 7.6.5

### Patch Changes

- ee86f4a: Upgrade express version
- Updated dependencies [ee86f4a]
  - @gasket/utils@7.6.6
  - @gasket/core@7.7.4

## 7.6.4

### Patch Changes

- Updated dependencies [fdd8860]
  - @gasket/utils@7.6.5
  - @gasket/core@7.7.3

## 7.6.3

### Patch Changes

- Updated dependencies [31bf06b]
  - @gasket/core@7.7.2
  - @gasket/utils@7.6.4

## 7.6.2

### Patch Changes

- Updated dependencies [db09b09]
  - @gasket/utils@7.6.4
  - @gasket/core@7.7.1

## 7.6.1

### Patch Changes

- Updated dependencies [97b32ad]
  - @gasket/core@7.7.0
  - @gasket/utils@7.6.3

## 7.6.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files

### Patch Changes

- @gasket/core@7.6.3
- @gasket/utils@7.6.3

## 7.5.3

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples
- c76c388: Add support to return an array of commands from the hook
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/utils@7.6.3
  - @gasket/core@7.6.3

## 7.5.2

### Patch Changes

- Updated dependencies [f2ff987]
  - @gasket/utils@7.6.2
  - @gasket/core@7.6.2

## 7.5.1

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/utils@7.6.1
  - @gasket/core@7.6.1

## 7.5.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/utils@7.6.0
  - @gasket/core@7.6.0

## 7.4.3

### Patch Changes

- Updated dependencies [06999d5]
  - @gasket/utils@7.5.0
  - @gasket/core@7.5.3

## 7.4.2

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/utils@7.4.2
  - @gasket/core@7.5.2

## 7.4.1

### Patch Changes

- Updated dependencies [39a8007]
- Updated dependencies [9a98fd0]
  - @gasket/core@7.5.1
  - @gasket/utils@7.4.1

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/utils@7.4.0
  - @gasket/core@7.5.0

## 7.3.9

### Patch Changes

- Updated dependencies [63ba7ba]
- Updated dependencies [63ba7ba]
  - @gasket/utils@7.3.5
  - @gasket/core@7.4.2

## 7.3.8

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli
  - @gasket/core@7.4.1

## 7.3.7

### Patch Changes

- db3bf54: Add CJS transpile to ESM packages
  - @gasket/core@7.4.1

## 7.3.6

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/utils@7.3.4
  - @gasket/core@7.4.1

## 7.3.5

### Patch Changes

- Updated dependencies [8e774bb]
  - @gasket/core@7.4.0
  - @gasket/utils@7.3.3

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/utils@7.3.3
  - @gasket/core@7.3.3

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/utils@7.3.2
  - @gasket/core@7.3.2

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/utils@7.3.1
  - @gasket/core@7.3.1

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/utils@7.3.0
  - @gasket/core@7.3.0

## 7.2.0

- Invoke commands lifecycles during prepare ([#1016])
- Always register the command called; not filtered by what's been registered

## 7.1.0

- Improvements to gasket command setup with async `prepare` lifecycle ([#989], [#991])

## 7.0.15

- Do not transpile to cjs ([#980])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Update package with version 7 custom commands implementation

## 6.38.3

- Tweaks to GasketCommand types ([#557])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.27.0

- Support for `GASKET_ENV` with fallback to `NODE_ENV` ([#387])

## 6.24.3

- Support for --require flag to load modules before Gasket initializes ([#370])

## 6.20.0

- Move config overrides to CLI ([#348])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.1.0

- Clean markdown from jsdocs ([#141])

## 5.0.0

- Open Source Release

## 2.0.2

- Fix `init` lifecycle to execute before `configure` ([#94])

## 2.0.0

- Move GasketCommand to this plugin ([#74])
- Allow plugins to add flags to commands in `getCommands` lifecycle.
- Improved documentation

## 1.1.0

- Align package structure and dependencies

## 1.0.1

- [#52] Add missing name

## 1.0.2

- Migrated to monorepo

## 1.0.1

- Update the name of the oclif hack to be more explicit.

## 1.0.0

- Initial release

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#52]: https://github.com/godaddy/gasket/pull/52
[#74]: https://github.com/godaddy/gasket/pull/74
[#94]: https://github.com/godaddy/gasket/pull/94
[#141]: https://github.com/godaddy/gasket/pull/141
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#348]: https://github.com/godaddy/gasket/pull/348
[#370]: https://github.com/godaddy/gasket/pull/370
[#387]: https://github.com/godaddy/gasket/pull/387
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#980]: https://github.com/godaddy/gasket/pull/980
[#989]: https://github.com/godaddy/gasket/pull/989
[#991]: https://github.com/godaddy/gasket/pull/991
[#1016]: https://github.com/godaddy/gasket/pull/1016
