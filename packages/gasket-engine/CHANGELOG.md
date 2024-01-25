# `@gasket/engine`

### 6.45.0

- Fix types add plugins to environments ([#638])

### 6.43.0

- Fix incorrect location of the command structure in the TypeScript definition ([#627])

### 6.39.3

- Fix hook timing type ([#599])

### 6.38.8

- Fix bug with `execWaterfallSync` not supporting nullish return values ([#596])
- Add missing gasket engine `hook` method to types ([#594])

### 6.38.5

- Fix to use long name for named app plugins ([#560])

### 6.36.0

- Add missing dependencies property on the `Plugin` type

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

### 6.34.2

- Upgrade eslint-plugin-jest ([#457])

### 6.26.1

- GasketEngine types tweaks ([#385])

### 6.24.2

- Fix types for execApply* callback handlers - do not need gasket arg ([#377])

### 6.20.4

- Expose the Gasket engine class so TypeScript code can construct engine instances ([#356])

### 6.19.0

- Allow differing callbacks for `execApply` and `execApplySync` ([#345])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.7.3

- Fix issue causing unhandled rejection warnings to surface ([#299])

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
[#299]: https://github.com/godaddy/gasket/pull/299
[#311]: https://github.com/godaddy/gasket/pull/311
[#345]: https://github.com/godaddy/gasket/pull/345
[#356]: https://github.com/godaddy/gasket/pull/356
[#377]: https://github.com/godaddy/gasket/pull/377
[#385]: https://github.com/godaddy/gasket/pull/385
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#560]: https://github.com/godaddy/gasket/pull/560
[#594]: https://github.com/godaddy/gasket/pull/594
[#596]: https://github.com/godaddy/gasket/pull/596
[#599]: https://github.com/godaddy/gasket/pull/599
[#627]: https://github.com/godaddy/gasket/pull/627
[#638]: https://github.com/godaddy/gasket/pull/638

[Loader]:/packages/gasket-resolve/docs/api.md#loader
