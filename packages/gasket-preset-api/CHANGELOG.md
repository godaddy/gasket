# `@gasket/preset-api`

## 7.3.5

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-dynamic-plugins@7.3.4
  - @gasket/plugin-docusaurus@7.3.3
  - @gasket/plugin-typescript@7.3.3
  - @gasket/plugin-command@7.3.4
  - @gasket/plugin-cypress@7.3.3
  - @gasket/plugin-express@7.3.3
  - @gasket/plugin-fastify@7.3.4
  - @gasket/plugin-swagger@7.3.4
  - @gasket/plugin-winston@7.3.3
  - @gasket/plugin-logger@7.3.3
  - @gasket/plugin-https@7.3.4
  - @gasket/plugin-mocha@7.3.4
  - @gasket/plugin-docs@7.3.4
  - @gasket/plugin-jest@7.3.4
  - @gasket/plugin-lint@7.3.5
  - @gasket/plugin-git@7.3.3

## 7.3.4

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-dynamic-plugins@7.3.3
  - @gasket/plugin-docusaurus@7.3.2
  - @gasket/plugin-typescript@7.3.2
  - @gasket/plugin-command@7.3.3
  - @gasket/plugin-cypress@7.3.2
  - @gasket/plugin-express@7.3.2
  - @gasket/plugin-fastify@7.3.3
  - @gasket/plugin-swagger@7.3.3
  - @gasket/plugin-winston@7.3.2
  - @gasket/plugin-logger@7.3.2
  - @gasket/plugin-https@7.3.3
  - @gasket/plugin-mocha@7.3.3
  - @gasket/plugin-docs@7.3.3
  - @gasket/plugin-jest@7.3.3
  - @gasket/plugin-lint@7.3.4
  - @gasket/plugin-git@7.3.2

## 7.3.3

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [f716c9e]
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-express@7.3.1
  - @gasket/plugin-fastify@7.3.2
  - @gasket/plugin-dynamic-plugins@7.3.2
  - @gasket/plugin-docusaurus@7.3.1
  - @gasket/plugin-typescript@7.3.1
  - @gasket/plugin-command@7.3.2
  - @gasket/plugin-cypress@7.3.1
  - @gasket/plugin-swagger@7.3.2
  - @gasket/plugin-winston@7.3.1
  - @gasket/plugin-logger@7.3.1
  - @gasket/plugin-https@7.3.2
  - @gasket/plugin-mocha@7.3.2
  - @gasket/plugin-docs@7.3.2
  - @gasket/plugin-jest@7.3.1
  - @gasket/plugin-lint@7.3.2
  - @gasket/plugin-git@7.3.1

## 7.3.2

### Patch Changes

- Updated dependencies [87ea998]
- Updated dependencies [cd76a80]
  - @gasket/plugin-dynamic-plugins@7.3.1
  - @gasket/plugin-command@7.3.1
  - @gasket/plugin-swagger@7.3.1
  - @gasket/plugin-https@7.3.1
  - @gasket/plugin-mocha@7.3.1
  - @gasket/plugin-lint@7.3.1
  - @gasket/plugin-cypress@7.3.0
  - @gasket/plugin-docs@7.3.1
  - @gasket/plugin-docusaurus@7.3.0
  - @gasket/plugin-express@7.3.0
  - @gasket/plugin-fastify@7.3.1
  - @gasket/plugin-git@7.3.0
  - @gasket/plugin-jest@7.3.0
  - @gasket/plugin-logger@7.3.0
  - @gasket/plugin-typescript@7.3.0
  - @gasket/plugin-winston@7.3.0

## 7.3.1

### Patch Changes

- Updated dependencies [4b6d124]
  - @gasket/plugin-fastify@7.3.1
  - @gasket/plugin-swagger@7.3.0

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-dynamic-plugins@7.3.0
  - @gasket/plugin-docusaurus@7.3.0
  - @gasket/plugin-typescript@7.3.0
  - @gasket/plugin-command@7.3.0
  - @gasket/plugin-cypress@7.3.0
  - @gasket/plugin-express@7.3.0
  - @gasket/plugin-fastify@7.3.0
  - @gasket/plugin-swagger@7.3.0
  - @gasket/plugin-winston@7.3.0
  - @gasket/plugin-logger@7.3.0
  - @gasket/plugin-https@7.3.0
  - @gasket/plugin-mocha@7.3.0
  - @gasket/plugin-docs@7.3.0
  - @gasket/plugin-jest@7.3.0
  - @gasket/plugin-lint@7.3.0
  - @gasket/plugin-git@7.3.0

### 7.2.3

- Remove metadata plugin ([#1034])

## 7.2.0

- Move default plugins into presets ([#1014])

## 7.1.4

- Remove routes import from the `server.ts` ([#1011])

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Convert to ESM ([#736])
- Add generator files
- Add `create` hook
- Add preset hooks `presetPrompt` and `presetConfig`
- Add tests
- Update dependencies

## 6.44.6

- revert docsify dep change ([#662])

## 6.44.2

- Deprecate Docsify ([#648])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Upgrade dependencies to 6.0.0 ([#243])

## 5.9.0

- Created and integrated Gasket API Preset ([#181])

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#181]: https://github.com/godaddy/gasket/pull/181
[#243]: https://github.com/godaddy/gasket/pull/243
[#311]: https://github.com/godaddy/gasket/pull/311
[#648]: https://github.com/godaddy/gasket/pull/648
[#662]: https://github.com/godaddy/gasket/pull/662
[#736]: https://github.com/godaddy/gasket/pull/736
[#1011]: https://github.com/godaddy/gasket/pull/1011
[#1014]: https://github.com/godaddy/gasket/pull/1014
[#1034]: https://github.com/godaddy/gasket/pull/1034
