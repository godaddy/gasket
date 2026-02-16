# `@gasket/plugin-https`

## 7.4.1

### Patch Changes

- fdd8860: Avoid **dirname and **filename const names

## 7.4.0

### Minor Changes

- 9b1bb5b: ESM port

## 7.3.12

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.3.11

### Patch Changes

- f2ff987: Tune eslint9 configs

## 7.3.10

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.3.9

### Patch Changes

- d0a34d9: Add typing for keepAliveTimeout gasket config option

## 7.3.8

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.3.7

### Patch Changes

- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag

## 7.3.6

### Patch Changes

- c46c389: Bring back preboot lifecycle with prepare server actions

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
- cd76a80: Allow partial https in gasket config.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.2.2

- Add configure hook to set a default for the root property inside the https|htt2 config options ([#1028])

## 7.1.0

- Aligned version releases across all packages

## 7.0.6

- Pretty logs when custom port not configured ([#952])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file
- Add actions to hook exec types

## 6.46.4

- Adjust JSDocs and TS types ([#695])

## 6.44.0

- Better surfacing of server startup errors ([#634])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.34.2

- Upgrade eslint-plugin-jest ([#457])

## 6.33.1

- Fix for port fallback ([#433])

## 6.32.0

- Add `hostname` config setting to type declarations ([#412])

## 6.11.0

- Added healthcheck.html to terminus options. ([#315])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.5.0

- Add support for http2 servers ([#287])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.1.3

- Set http fallbacks after createServer lifecycle ([#146])

## 5.0.1

- Update default http port ([#130])

## 5.0.0

- Open Source Release

## 2.2.1

- Handle permeations of [create-servers] callback ([#92])

## 2.2.0

- Graceful shutdown using [terminus] ([#90])

## 2.1.1

- Default to http port 80 when not configured and log start-up errors ([#79])

## 2.1.0

- Align package structure and dependencies

## 2.0.0

- [#23] Dismantling core-plugin
- [#7]: Initialize the `https-plugin`

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#7]: https://github.com/godaddy/gasket/pull/7
[#23]: https://github.com/godaddy/gasket/pull/23
[#79]: https://github.com/godaddy/gasket/pull/79
[#90]: https://github.com/godaddy/gasket/pull/90
[#92]: https://github.com/godaddy/gasket/pull/92
[#130]: https://github.com/godaddy/gasket/pull/130
[#146]: https://github.com/godaddy/gasket/pull/146
[#247]: https://github.com/godaddy/gasket/pull/247
[#287]: https://github.com/godaddy/gasket/pull/287
[#311]: https://github.com/godaddy/gasket/pull/311
[#315]: https://github.com/godaddy/gasket/pull/315
[#412]: https://github.com/godaddy/gasket/pull/412
[#433]: https://github.com/godaddy/gasket/pull/433
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#634]: https://github.com/godaddy/gasket/pull/634
[#695]: https://github.com/godaddy/gasket/pull/695
[#736]: https://github.com/godaddy/gasket/pull/736
[#952]: https://github.com/godaddy/gasket/pull/952
[#1028]: https://github.com/godaddy/gasket/pull/1028
[terminus]: https://github.com/godaddy/terminus
[create-servers]: https://github.com/http-party/create-servers
