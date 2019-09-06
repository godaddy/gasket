# `@gasket/plugin-engine`

- Engine uses [Loader] from `@gasket/resolve` to load configured plugins ([#64])
  - Loader instance exposed by engine instance
  - Engine does not initiate metadata

### 1.5.0

- Align package structure and dependencies

### 1.4.0

- Including presets and plugins paths into `config.metadata`

### 1.3.0

- Migrated to monorepo
- Warns user about bad plugin timings

### 1.2.0

- Add `execApply`, and `execApplySync` methods.
- Add `execMap`, `execMapSync`, methods.

### 1.1.0

- Improving on preset data structures.

### 1.0.1

- Throw `MODULE_NOT_FOUND` errors that are for requiring other modules.

### 1.0.0

- Consolidate resolution methods into `Resolver`.

[#64]: https://github.com/godaddy/gasket/pull/64

[Loader]:/packages/gasket-resolve/README.md#Loader
