# `@gasket/plugin-express`

### 6.46.0

- Add native Gasket trust proxy support to Express config ([#675])

### 6.45.2

- Remove obsolete `devDeps` ([#670])

### 6.44.0

- Documentation & type fixes ([#637])
  - Add missing type definition for `routes` config property
  - Add `middlewareInclusionRegex` config property, deprecating `excludedRoutesRegex`

### 6.41.2

- Fix ordering of error middlewares so they come after API routes
- Docs on configuring middleware paths ([#613])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.33.1

- Fix ability to use async `middleware` hooks ([#444])

### 6.17.1

- Update glob path from `__dirname` ([#337])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.5.0

- Add support for using http2 servers ([#287])

### 6.0.5

- Filter falsy middleware ([#255])

### 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

### 5.9.0

- Created and integrated Gasket API Preset ([#181])

### 5.0.0

- Open Source Release

### 2.1.0

- Align package structure and dependencies

### 2.0.0

- Dismantling core-plugin ([#23])

### 1.0.0

- Renaming express-create to expressCreate
- Separate express plugins from core
- Initial release.

[#23]: https://github.com/godaddy/gasket/pull/23
[#181]: https://github.com/godaddy/gasket/pull/181
[#247]: https://github.com/godaddy/gasket/pull/247
[#255]: https://github.com/godaddy/gasket/pull/255
[#287]: https://github.com/godaddy/gasket/pull/287
[#311]: https://github.com/godaddy/gasket/pull/311
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#444]: https://github.com/godaddy/gasket/pull/444
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#613]: https://github.com/godaddy/gasket/pull/613
[#637]: https://github.com/godaddy/gasket/pull/637
[#670]: https://github.com/godaddy/gasket/pull/670
[#675]: https://github.com/godaddy/gasket/pull/675
