# `@gasket/nextjs`

## 7.5.2

### Patch Changes

- Updated dependencies [9a98fd0]
  - @gasket/request@7.4.2
  - @gasket/data@7.4.2

## 7.5.1

### Patch Changes

- Updated dependencies [39e41cb]
  - @gasket/request@7.4.1
  - @gasket/data@7.4.1

## 7.5.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/request@7.4.0
  - @gasket/data@7.4.0

## 7.4.5

### Patch Changes

- Updated dependencies [63ba7ba]
- Updated dependencies [63ba7ba]
  - @gasket/request@7.3.6
  - @gasket/data@7.3.5

## 7.4.4

### Patch Changes

- 6041519: Add npm exports support to loading presets in the cli
  - @gasket/data@7.3.4

## 7.4.3

### Patch Changes

- db3bf54: Add CJS transpile to ESM packages

## 7.4.2

### Patch Changes

- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/request@7.3.5
  - @gasket/data@7.3.4

## 7.4.1

### Patch Changes

- ea983c6: Adjust peer dep ranges for next and react versions

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

### Patch Changes

- @gasket/request@7.3.4

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/request@7.3.4
  - @gasket/data@7.3.3

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/request@7.3.3
  - @gasket/data@7.3.2

## 7.3.2

### Patch Changes

- 721e8ad: Bump next.js version to latest patch to mitigate critical vulnerability.

## 7.3.1

### Patch Changes

- 438a865: fix async timing issue with gasket data & app router
- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/request@7.3.1
  - @gasket/data@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/request@7.3.0
  - @gasket/data@7.3.0

## 7.1.0

- Use normalized GasketRequest ([#973])
  - Deprecating request from `@gasket/nextjs/server` for
    `@gasket/nextjs/request`
  - Supports Next 15 async headers

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add gasketData layout for app router ([#814])
- Add file extensions to imports, fix package exports conflict ([#778])

## 6.45.2

- Refactor tests to Jest, update test scripts, add `cross-env`, remove obsolete `devDeps` ([#670])

## 6.43.0

- Upgrade to Next.js 13.1.1 ([#614])

## 6.40.0

- Fix TypeScript declarations for HOCs ([#603])

## 6.37.0

- Migrate from Enzyme to React Testing Library ([#523])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.34.2

- Upgrade jsdom to v20 ([#440])

## 6.20.3

- Switch Enzyme adapter for React 17 ([#354])

## 6.8.0

- Add `withGasketDataProvider` and `useGasketData` React hook ([#298])

## 6.4.0

- Upgrade to next@^10.2 ([#285]).

## 6.0.9

- Adjust peerDependencies ([#262])

## 6.0.0

- Initial release

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#262]: https://github.com/godaddy/gasket/pull/262
[#285]: https://github.com/godaddy/gasket/pull/285
[#298]: https://github.com/godaddy/gasket/pull/298
[#354]: https://github.com/godaddy/gasket/pull/354
[#436]: https://github.com/godaddy/gasket/pull/436
[#440]: https://github.com/godaddy/gasket/pull/440
[#442]: https://github.com/godaddy/gasket/pull/442
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
[#523]: https://github.com/godaddy/gasket/pull/523
[#603]: https://github.com/godaddy/gasket/pull/603
[#614]: https://github.com/godaddy/gasket/pull/614
[#670]: https://github.com/godaddy/gasket/pull/670
[#778]: https://github.com/godaddy/gasket/pull/778
[#814]: https://github.com/godaddy/gasket/pull/814
[#973]: https://github.com/godaddy/gasket/pull/973
