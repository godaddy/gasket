# `@gasket/plugin-docusaurus`

## 8.0.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- 63868e0: remove presets and related docs
- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports
- Updated dependencies [63868e0]
- Updated dependencies [ed9a857]
- Updated dependencies [b235fc1]
- Updated dependencies [d99ffaf]
- Updated dependencies [ed9a857]
  - @gasket/plugin-logger@8.0.0

## 8.0.0-next.1

### Patch Changes

- 63868e0: remove presets and related docs
- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports
- Updated dependencies [63868e0]
- Updated dependencies [ed9a857]
- Updated dependencies [d99ffaf]
- Updated dependencies [ed9a857]
  - @gasket/plugin-logger@8.0.0-next.1

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- Updated dependencies [b235fc1]
  - @gasket/plugin-logger@8.0.0-next.0

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- Updated dependencies [7d1d8bf]
- Updated dependencies [9b1bb5b]
  - @gasket/plugin-logger@7.4.0

## 7.4.6

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [da18ea5]
  - @gasket/plugin-logger@7.3.8

## 7.4.5

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/plugin-logger@7.3.6

## 7.4.4

### Patch Changes

- 696b43f: Fix missing modules on docs site, upgrade docusaurus, remove require from metadata plugin, remove lifecycle graphs
  - @gasket/plugin-logger@7.3.5

## 7.4.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/plugin-logger@7.3.5

## 7.4.2

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/plugin-logger@7.3.4

## 7.4.1

### Patch Changes

- a490392: Only add react devDeps if not already in deps
  - @gasket/plugin-logger@7.3.3

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

### Patch Changes

- @gasket/plugin-logger@7.3.3

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-logger@7.3.3

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-logger@7.3.2

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-logger@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-logger@7.3.0

### 7.2.3

- Make plugin dynamic ([#1034])

## 7.1.0

- Aligned version releases across all packages

## 7.0.3

- Add create hook check with dev deps ([#937])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file
- `configure` hook now synchronous

## 6.46.0

- Adjust path on tryRequire to handle dep check ([#674])

## 6.45.2

- Add `peerDeps`, unpin Docusaurus ([#670])

## 6.44.5

- add docusaurus to devDeps, add dep check, add create hook ([#658])

## 6.44.3

- Lazy load Docusaurus, update devDependencies ([#650])

## 6.35.0

- Upgrade @docusaurus/\* to v2.2.0 ([#481])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.24.2

- Add `index.d.ts` type definitions
- Update `docsView` test case ([#367])

## 6.23.1

- Add support for configuration of the Docusaurus docs directory ([#364])

## 6.23.0

- Initial release ([#362])

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#362]: https://github.com/godaddy/gasket/pull/362
[#364]: https://github.com/godaddy/gasket/pull/364
[#367]: https://github.com/godaddy/gasket/pull/367
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#481]: https://github.com/godaddy/gasket/pull/481
[#650]: https://github.com/godaddy/gasket/pull/650
[#658]: https://github.com/godaddy/gasket/pull/658
[#670]: https://github.com/godaddy/gasket/pull/670
[#674]: https://github.com/godaddy/gasket/pull/674
[#736]: https://github.com/godaddy/gasket/pull/736
[#937]: https://github.com/godaddy/gasket/pull/937
[#1034]: https://github.com/godaddy/gasket/pull/1034
