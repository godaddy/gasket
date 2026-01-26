# `@gasket/plugin-lint`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.4

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.4.3

### Patch Changes

- 026d359: Fix missing dep

## 7.4.2

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.1

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.3.6

### Patch Changes

- 0b6c4f6: force eslint-plugin-react-hooks version on different code styles
- eb403a8: Audit ts-ignores.

## 7.3.5

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.4

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.3

### Patch Changes

- 43b7e31: Fix npm script creation for new PNPM apps.

## 7.3.2

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.1

### Patch Changes

- 87ea998: Add missing dep to lint plugin, adjust TS type exports

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.2.2

- Predefine lint plugin dep versions ([#1029])

## 7.1.7

- Pin GoDaddy ESLint packages with ESLint 8 compatability ([#1019])

## 7.1.0

- Aligned version releases across all packages

## 7.0.3

- Add create dev deps ([#937])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes

## 6.45.2

- Tune `devDeps` ([#670])

## 6.35.0

- add cjs extension to lint package ([#482])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.17.4

- Fix to include eslint-plugin-react-intl as devDependency ([#342])

## 6.17.3

- For GoDaddy code style, always use eslint version from main config ([#341])

## 6.17.2

- Added logic to add next eslintConfig for new nextjs apps ([#340])

## 6.0.2

- Added settings config for eslint-ing of React-Intl. ([#251])

## 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

## 5.1.0

- Add support for scope-only package short names with eslint configs. ([#142])

## 5.0.0

- Open Source Release

## 2.0.0

- Refactored to prompt for code styles and allow custom ESLint or stylelint configs to be set. ([#98])
  - Supported code styles: [GoDaddy], [Standard], [Airbnb]

## 1.7.3

- Fix package.json scripts to wrap glob patterns in double-quotes
- Change output for `stylelint` script to have the glob pattern be double-quoted

## 1.7.0

- Changed package manager install to support both npm and yarn

## 1.6.0

- Run `lint` and `stylelint` in gasket's `postCreate` lifecycle

## 1.5.1

- Override `jsx-a11y/anchor-is-valid` for next/link.

## 1.5.0

- Upgrades to create dependencies with jsx-a11y plugin.

## 1.4.0

- Upgrades to dependencies in create hook.

## 1.3.0

- Include jsx files.
- Add stylelint during create hook.

## 1.2.0

- Catch all pattern with ignores.

## 1.1.0

- Move eslint settings to package.json.

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[GoDaddy]: README.md#godaddy
[Standard]: README.md#standard
[Airbnb]: README.md#airbnb
[#98]: https://github.com/godaddy/gasket/pull/98
[#142]: https://github.com/godaddy/gasket/pull/142
[#247]: https://github.com/godaddy/gasket/pull/247
[#251]: https://github.com/godaddy/gasket/pull/251
[#340]: https://github.com/godaddy/gasket/pull/340
[#341]: https://github.com/godaddy/gasket/pull/341
[#342]: https://github.com/godaddy/gasket/pull/342
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#482]: https://github.com/godaddy/gasket/pull/482
[#670]: https://github.com/godaddy/gasket/pull/670
[#937]: https://github.com/godaddy/gasket/pull/937
[#1019]: https://github.com/godaddy/gasket/pull/1019
[#1029]: https://github.com/godaddy/gasket/pull/1029
