# `@gasket/plugin-manifest`

### 6.0.0

- Fix to allow basic manifest to work with no config ([#244])
- Fix to remove config-only props from rendering in manifest.json ([#244])
- Ability to configure static output of manifest at build time ([#218])

### 5.0.0

- Open Source Release

### 1.3.0

- Align package structure and dependencies

### 1.2.1

- Migrated to monorepo

### 1.2.0

 Add `manifest.path` config option to allow serving `manifest.json` from a custom path

### 1.1.0

 Use execWaterfall for the manifest lifecycle

### 1.0.1

 Fix forward slash on endpoint

### 1.0.0

 Initial implementation
  - Serving `manifest.json`
  - Adding a `link` to the document `<head>`
  - Adding a new `manifest` lifecycle hook
  - Accepting `Manifest` setup in `gasket.config.js`

[#218]: https://github.com/godaddy/gasket/pull/218
[#244]: https://github.com/godaddy/gasket/pull/244
