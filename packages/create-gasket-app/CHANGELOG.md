# `create-gasket-app`

## 7.3.8

### Patch Changes

- Updated dependencies [6cf18c2]
  - @gasket/plugin-metadata@7.3.8
  - @gasket/core@7.4.1
  - @gasket/plugin-command@7.3.6
  - @gasket/plugin-docs@7.3.6
  - @gasket/plugin-docusaurus@7.4.2
  - @gasket/plugin-dynamic-plugins@7.3.5
  - @gasket/plugin-git@7.3.4
  - @gasket/plugin-logger@7.3.4

## 7.3.7

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/plugin-dynamic-plugins@7.3.5
  - @gasket/plugin-docusaurus@7.4.2
  - @gasket/plugin-metadata@7.3.7
  - @gasket/plugin-command@7.3.6
  - @gasket/plugin-logger@7.3.4
  - @gasket/plugin-docs@7.3.6
  - @gasket/plugin-git@7.3.4
  - @gasket/request@7.3.5
  - @gasket/utils@7.3.4
  - @gasket/core@7.4.1

## 7.3.6

### Patch Changes

- Updated dependencies [a490392]
  - @gasket/plugin-docusaurus@7.4.1
  - @gasket/plugin-command@7.3.5
  - @gasket/plugin-docs@7.3.5
  - @gasket/plugin-dynamic-plugins@7.3.4
  - @gasket/plugin-git@7.3.3
  - @gasket/plugin-logger@7.3.3
  - @gasket/plugin-metadata@7.3.6

## 7.3.5

### Patch Changes

- Updated dependencies [8e774bb]
- Updated dependencies [cc6b554]
  - @gasket/core@7.4.0
  - @gasket/plugin-docusaurus@7.4.0
  - @gasket/plugin-command@7.3.5
  - @gasket/plugin-docs@7.3.5
  - @gasket/plugin-dynamic-plugins@7.3.4
  - @gasket/plugin-git@7.3.3
  - @gasket/plugin-logger@7.3.3
  - @gasket/plugin-metadata@7.3.6
  - @gasket/request@7.3.4
  - @gasket/utils@7.3.3

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-dynamic-plugins@7.3.4
  - @gasket/plugin-docusaurus@7.3.3
  - @gasket/plugin-metadata@7.3.5
  - @gasket/plugin-command@7.3.4
  - @gasket/plugin-logger@7.3.3
  - @gasket/plugin-docs@7.3.4
  - @gasket/plugin-git@7.3.3
  - @gasket/request@7.3.4
  - @gasket/utils@7.3.3
  - @gasket/core@7.3.3

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-dynamic-plugins@7.3.3
  - @gasket/plugin-docusaurus@7.3.2
  - @gasket/plugin-metadata@7.3.4
  - @gasket/plugin-command@7.3.3
  - @gasket/plugin-logger@7.3.2
  - @gasket/plugin-docs@7.3.3
  - @gasket/plugin-git@7.3.2
  - @gasket/request@7.3.3
  - @gasket/utils@7.3.2
  - @gasket/core@7.3.2

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-dynamic-plugins@7.3.2
  - @gasket/plugin-docusaurus@7.3.1
  - @gasket/plugin-metadata@7.3.2
  - @gasket/plugin-command@7.3.2
  - @gasket/plugin-logger@7.3.1
  - @gasket/plugin-docs@7.3.2
  - @gasket/plugin-git@7.3.1
  - @gasket/request@7.3.1
  - @gasket/utils@7.3.1
  - @gasket/core@7.3.1

## 7.3.1

### Patch Changes

- Updated dependencies [87ea998]
  - @gasket/plugin-dynamic-plugins@7.3.1
  - @gasket/plugin-metadata@7.3.1
  - @gasket/plugin-command@7.3.1
  - @gasket/plugin-docs@7.3.1
  - @gasket/plugin-docusaurus@7.3.0
  - @gasket/plugin-git@7.3.0
  - @gasket/plugin-logger@7.3.0

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-dynamic-plugins@7.3.0
  - @gasket/plugin-docusaurus@7.3.0
  - @gasket/plugin-metadata@7.3.0
  - @gasket/plugin-command@7.3.0
  - @gasket/plugin-logger@7.3.0
  - @gasket/plugin-docs@7.3.0
  - @gasket/plugin-git@7.3.0
  - @gasket/request@7.3.0
  - @gasket/utils@7.3.0
  - @gasket/core@7.3.0

### 7.2.3

- Add `remove` to config-builder ([#1036])
- Add `addCommand` method for create context ([#1034])
- Add `addEnvironment` method for create context ([#1010])

## 7.2.0

- Move default plugins into presets ([#1014])

## 7.1.0

- Aligned version releases across all packages

- Added `@gasket/plugin-dynamic-plugin` to default plugins ([#970])

## 7.0.6

- Add JSDoc Typechecking to create-gasket-app ([#943])

## 7.0.2

- Add packageJson `type` type ([#936])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Exclude gaskets from client bundling ([#806])
- Modified global test prompt to ask for unit and integration tests ([#752])
- Force `GASKET_ENV` to create
- Add preset lifecycles `presetPrompt` and `presetConfig` ([#736])
- ESM refactor, package is now type module
- Gasket apps default to `type: module`
- Update the `load-preset` functionality
- Remove `addPlugins` utility
- Change the implementation of `gasket` usage to `makeGasket`
- Remove obsolete files
- Remove references to `@gasket/resolve`
- Remove `plugins`, `bootstrap` & `generate` flags
- Adjust prompt flag to `no-prompt`
- Remove plugin start references
- Adjust default plugins to remove lifecycle, metadata & start plugins
- Adjust `CreateContext` properties
- Add several methods to the `ConfigBuilder`
- Remove `setup.js` getopts script
- Update `writeGasketConfig` to write in ESM
- Update tests

## 6.46.6

- Fix resolve cli path ([#712])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.17.1

- Update relative path from `__dirname` ([#337])

## 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

## 5.6.2

- Fix bug with additional arguments ([#171])

## 5.6.0

- Introducing `create-gasket-app` ([#167])

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#167]: https://github.com/godaddy/gasket/pull/167
[#171]: https://github.com/godaddy/gasket/pull/171
[#247]: https://github.com/godaddy/gasket/pull/247
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#712]: https://github.com/godaddy/gasket/pull/712
[#736]: https://github.com/godaddy/gasket/pull/736
[#752]: https://github.com/godaddy/gasket/pull/752
[#806]: https://github.com/godaddy/gasket/pull/806
[#936]: https://github.com/godaddy/gasket/pull/936
[#943]: https://github.com/godaddy/gasket/pull/943
[#970]: https://github.com/godaddy/gasket/pull/970
[#1010]: https://github.com/godaddy/gasket/pull/1010
[#1014]: https://github.com/godaddy/gasket/pull/1014
[#1034]: https://github.com/godaddy/gasket/pull/1034
[#1036]: https://github.com/godaddy/gasket/pull/1036
