# `@gasket/plugin-typescript`

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
