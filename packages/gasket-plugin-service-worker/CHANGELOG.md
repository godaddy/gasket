# `@gasket/plugin-service-worker`

### 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

### 6.11.2

- Use fs.promises and upgrade mkdirp ([#319])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.0.0

- Ability to configure static output of service workers for build time ([#217])
- Context for `composeServiceWorker` changes for build vs request-based service workers ([#217])

### 5.3.1

- Inject registration script to Webpack entry modules ([#158])

### 5.0.0

- Open Source Release

### 1.3.0

- `serviceWorkerCacheKey` executed in `express` lifecycle ([#95])

### 1.2.0

- Align package structure and dependencies

### 1.1.1

- Migrated to monorepo

### 1.1.0

- Minify composed code in production

### 1.0.0

- Initial implementation.
- Support for caching sw content

[#95]:https://github.com/godaddy/gasket/pull/95
[#158]: https://github.com/godaddy/gasket/pull/158
[#217]: https://github.com/godaddy/gasket/pull/217
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#347]: https://github.com/godaddy/gasket/pull/347
