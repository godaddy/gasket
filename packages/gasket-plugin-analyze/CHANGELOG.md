# `@gasket/plugin-analyze`

- Update create to use environment config ([#1010])
  - Fix for ANALYZE env var check with support for analyze in Gasket env check

### 7.1.0

- Aligned version releases across all packages

### 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Remove the custom command and replace it with an npm script that sets an environment variable ([#810])

### 6.46.4

- Adjust JSDocs and TS types ([#695])

### 6.45.2

- Add `cross-env`, adjust test script, remove `eslint-plugin-mocha` ([#670])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

### 6.34.2

- Upgrade eslint-plugin-jest ([#457])

### 6.20.3

- Upgrade `webpack-bundle-analyzer` ([#354])

### 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.0.0

- version alignment
- upgrade dependencies ([#247])

### 5.3.3

- Update webpack-bundle-analyzer@^3.7.0 ([#161])

### 5.0.0

- Open Source Release

### 2.0.0

- Move **analyze** command from CLI to this plugin ([#74])

### 1.2.0

- Align package structure and dependencies

### 1.1.1

- Migrated to monorepo

### 1.1.0

- Use webpack-bundle-analyzer directly.
- Add analyze script in create lifecycle

### 1.0.0

- Initial release.


[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#74]: https://github.com/godaddy/gasket/pull/74
[#161]: https://github.com/godaddy/gasket/pull/161
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#347]: https://github.com/godaddy/gasket/pull/347
[#354]: https://github.com/godaddy/gasket/pull/354
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
[#695]: https://github.com/godaddy/gasket/pull/695
[#810]: https://github.com/godaddy/gasket/pull/810
[#1010]: https://github.com/godaddy/gasket/pull/1010
