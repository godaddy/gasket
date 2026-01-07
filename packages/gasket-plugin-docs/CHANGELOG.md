# `@gasket/plugin-docs`

## 7.5.3

### Patch Changes

- 31bf06b: Upgrade glob (v8→v13) and rimraf (v3→v6) dependencies.
  - @gasket/plugin-command@7.6.3

## 7.5.2

### Patch Changes

- db09b09: Improve JSDocs
  - @gasket/plugin-command@7.6.2

## 7.5.1

### Patch Changes

- @gasket/plugin-command@7.6.1

## 7.5.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- Updated dependencies [7d1d8bf]
  - @gasket/plugin-command@7.6.0

## 7.4.8

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
- Updated dependencies [c76c388]
  - @gasket/plugin-command@7.5.3

## 7.4.7

### Patch Changes

- f2ff987: Tune eslint9 configs
  - @gasket/plugin-command@7.5.2

## 7.4.6

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/plugin-command@7.5.1

## 7.4.5

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/plugin-command@7.5.0

## 7.4.4

### Patch Changes

- @gasket/plugin-command@7.4.3

## 7.4.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/plugin-command@7.4.2

## 7.4.2

### Patch Changes

- @gasket/plugin-command@7.4.1

## 7.4.1

### Patch Changes

- 116aa96: Fix local script watcher
  - @gasket/plugin-command@7.4.0

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/plugin-command@7.4.0

## 7.3.9

### Patch Changes

- 63ba7ba: Adjustments to types
- 0c8f998: Opt for node bin over tsx
  - @gasket/plugin-command@7.3.9

## 7.3.8

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli
- Updated dependencies [6041519]
  - @gasket/plugin-command@7.3.8

## 7.3.7

### Patch Changes

- Updated dependencies [db3bf54]
  - @gasket/plugin-command@7.3.7

## 7.3.6

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/plugin-command@7.3.6

## 7.3.5

### Patch Changes

- @gasket/plugin-command@7.3.5

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-command@7.3.4

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-command@7.3.3

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-command@7.3.2

## 7.3.1

### Patch Changes

- Updated dependencies [87ea998]
  - @gasket/plugin-command@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-command@7.3.0

### 7.2.3

- Make plugin dynamic ([#1034])

## 7.1.0

- Aligned version releases across all packages

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file

## 6.44.1

- Add the default docs directory `.docs` to `.gitignore` on project creation. ([#644])

## 6.37.0

- Jest refactor ([#504])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.27.1

- Add support for lifecycles deprecated property in generated docs ([#391])

## 6.25.0

- Update TypeScript types and docs ([#373])

## 6.24.3

- Allow for configurations in metadata config object ([#375])
- Include LICENSE.md in docsSetup hook files array ([#379])

## 6.24.2

- Update `docsSetupDefault` to include `LICENSE.md` ([#367])
- Pass plugin-level `docsSetup` handler parameters correctly, add test case ([#374])

## 6.24.0

- Fix relative link transforms ([#369])

## 6.11.2

- Use fs.promises ([#319])

## 6.10.1

- Generate doc links point to main branch ([#316])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

## 5.1.0

- Clean markdown from jsdocs ([#141])

## 5.0.2

- Only include doc files with extensions by default ([#139])

## 5.0.0

- Open Source Release

## 1.0.1

- Fallback to defaults when docs not configured ([#82])

## 1.0.0

- Initial release

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#82]: https://github.com/godaddy/gasket/pull/82
[#139]: https://github.com/godaddy/gasket/pull/139
[#141]: https://github.com/godaddy/gasket/pull/141
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#316]: https://github.com/godaddy/gasket/pull/316
[#319]: https://github.com/godaddy/gasket/pull/319
[#367]: https://github.com/godaddy/gasket/pull/367
[#369]: https://github.com/godaddy/gasket/pull/369
[#373]: https://github.com/godaddy/gasket/pull/373
[#374]: https://github.com/godaddy/gasket/pull/374
[#375]: https://github.com/godaddy/gasket/pull/375
[#379]: https://github.com/godaddy/gasket/pull/379
[#391]: https://github.com/godaddy/gasket/pull/391
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#504]: https://github.com/godaddy/gasket/pull/504
[#644]: https://github.com/godaddy/gasket/pull/644
[#736]: https://github.com/godaddy/gasket/pull/736
[#1034]: https://github.com/godaddy/gasket/pull/1034
