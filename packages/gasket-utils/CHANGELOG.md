# `@gasket/utils`


- Fixed issue where an `environments` section of config files was doing proper inheritance of dev environment settings for the `local` environment.

### 6.0.13

- Added --legacy-peer-deps flag to install cli. ([#275])

### 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

### 5.1.1

- Fix missing dependency

### 5.1.0

- Move and expose PackageManager from `@gasket/cli` ([#143])
  - Align tests to Mocha suite

### 5.0.0

- Open Source Release

### 1.2.0

- Align package structure and dependencies

### 1.1.0

- Adds functions:
  - `runShellCommand`

### 1.0.0

- Initial implementation. Adds:
  - `tryRequire`
  - `applyEnvironmentOverrides`


[#143]: https://github.com/godaddy/gasket/pull/143
[#247]: https://github.com/godaddy/gasket/pull/247
[#275]: https://github.com/godaddy/gasket/pull/275
