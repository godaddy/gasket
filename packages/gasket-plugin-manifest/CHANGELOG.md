# `@gasket/plugin-manifest`

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.27.1

- Add Fastify hook ([#390])
- extract reusable code into serve.js to be used by both Express/Fastify hooks ([#390])

### 6.11.2

- Use fs.promises ([#319])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.0.0

- Fix to allow basic manifest to work with no config ([#244])
- Fix to remove config-only props from rendering in manifest.json ([#244])
- Ability to configure static output of manifest at build time ([#218])
- Upgraded dev dependencies ([#247])

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
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#390]: https://github.com/godaddy/gasket/pull/390
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
