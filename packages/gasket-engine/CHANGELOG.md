# `@gasket/engine`

### 6.0.11

- Add ability to do debug tracing for the plugin lifecycle ([#267])

### 6.0.0

- Remove package name fallbacks ([#227])

### 5.3.2

- Fix module path check regex to support Windows paths ([#160])

### 5.0.0

- Open Source Release
- Remove unnecessary warning ([#124])
- Support new name convention with fallback support ([#100])
- Prefers package names for plugin keying. ([#100])

### 2.0.0

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
[#100]: https://github.com/godaddy/gasket/pull/100
[#124]: https://github.com/godaddy/gasket/pull/124
[#160]: https://github.com/godaddy/gasket/pull/160
[#227]: https://github.com/godaddy/gasket/pull/227
[#267]: https://github.com/godaddy/gasket/pull/267

[Loader]:/packages/gasket-resolve/docs/api.md#loader
