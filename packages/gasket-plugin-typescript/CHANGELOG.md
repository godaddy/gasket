# `@gasket/plugin-typescript`

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

## 7.4.6

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- da18ea5: Add code examples

## 7.4.5

### Patch Changes

- 5d38a2e: Eslint version 9

## 7.4.4

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.

## 7.4.3

### Patch Changes

- 7642bea: Update generated tsconfig
- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag

## 7.4.2

### Patch Changes

- 388c23f: Updates to allow dynamically generating scripts and commands for npm, yarn, and pnpm instead of being hardcoded to specific package managers.

## 7.4.1

### Patch Changes

- 116aa96: Fix local script watcher

## 7.4.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

## 7.3.5

### Patch Changes

- 0c8f998: Opt for node bin over tsx

## 7.3.4

### Patch Changes

- eb403a8: Audit ts-ignores.

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.4

- Remove routes import from the `server.ts` ([#1011])

## 7.1.0

- Add HTTPS proxy server to Next.js dev server ([#982])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Initial release

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#982]: https://github.com/godaddy/gasket/pull/982
[#1011]: https://github.com/godaddy/gasket/pull/1011
