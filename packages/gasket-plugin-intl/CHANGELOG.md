# `@gasket/plugin-intl`

### 6.45.2

- Remove `eslint-plugin-mocha` & `setup-env` ([#670])
- Support debug logging under namespace `gasket:plugin:intl:*`

### 6.38.7

- Add missing runtime dependency to the package.json ([#593])

### 6.35.1

- Add option to preload locales file ([#491])

### 6.34.5

- Upgrade fs-extra to v10 ([#467])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade react-intl to v6 ([#451])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.30.1

- Fix middleware hook handler ([#403])

### 6.30.0

- Add `apmTransaction` hook ([#400])

### 6.24.0

- Add Fastify support ([#366])

### 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

### 6.16.1

- Fix to not polyfill intl for node >= 14 ([#336])

### 6.11.2

- Use fs.promises ([#319])

### 6.11.1

- Reduce bad accept-language log to `debug` level ([#320])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.8.3

- Ability to disable Next.js Intl Routing when configuring `locales` ([#310])

### 6.8.2

- Handle malformed and inconsistent formatted accept-language header ([#302])

### 6.7.2

- Minor fix to update logger to use `gasket.logger.warning` ([#297])

### 6.5.2

- Handle/log accept.language exceptions ([#290])

### 6.0.12

- Improve logging for missing locale files and manifest write errors ([#274])

### 6.0.10

- Add additional safety checks around accessing gasketData ([#263])
- Fix to use configured intl.localesDir for serving static files ([#265])
- Safer base path config selection ([#266])

### 6.0.4

- Fix to use defaultPath in workbox lifecycle ([#254])

### 6.0.0

- Fix to handle default `localesDir` for metadata ([#245])
- Fix missing dependencies ([#243])
- Opt-in `serveStatic` support for locales files with server layer ([#242])
- Add locales config to specify a list of supported locales ([#232])
- Adjust intlLocale lifecycle to provide extras in a context object ([#232])
- Attach the configured localesDir to `res.locals` for use during SSR ([#225])
- Add req methods for loading/selecting locales messages with gasketData ([#223])
  - Updates for defaultPath property name
  - Fix manifest paths to include base path
- Decoupled from Redux ([#180])
  - Request-based settings moved to gasketData in response object
- Decoupled from Express ([#180])
  - Locale files should be served with apps static content
  - Middleware exist for handling locales on server-side
- Alignment of options terms to locale instead of locale + language ([#180])
- Fix path for generated locale file ([#216])
- Use new `composeServiceWorker` context for determining locale precache config ([#217])

### 5.7.0

- Create new apps with `react-intl` v5 ([#175])

### 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

### 5.1.2

- Fixed missing `await` when saving locales-manifest.json file ([#144])

### 5.0.0

- Open Source Release

### 4.2.0

- Polyfill Intl in node for SSR

### 4.1.0

- Create new apps with `react-intl` as direct dependency

### 4.0.2

- Create new apps with `@gasket/react-intl@4`

### 4.0.1

- Fix `initReduxState` from stomping over existing state

### 4.0.0

- Execute `intlLanguage` lifecycle to determine language
- Set `intl.language` on redux state instead of market cookie
- Migrated to monorepo
- Align package structure and dependencies

### 3.1.2

- Use url-join package to resolve assetPrefix paths

### 3.1.1

- Allow `@gasket/log-plugin@3`
- Fix security audit failures
- Fix babel configuration

### 3.1.0

- Precache locale files with Workbox

### 3.0.0

- Uses `assetPrefix` from plugin config for CDN support
  - Removes use of `apiBase`
- Provides `req.localesDir` for outputDir from plugin config
- Moves locale file endpoint to `/_locales` with better cache control headers

### 2.0.0

- Depend on `@gasket/*` 2.0 packages for Next & Babel 7 support.

### 1.1.0

- Add files from `@gasket/app-template`.

### 1.0.0

- Initial release.

<!-- LINK -->

[#144]: https://github.com/godaddy/gasket/pull/144
[#166]: https://github.com/godaddy/gasket/pull/166
[#175]: https://github.com/godaddy/gasket/pull/175
[#180]: https://github.com/godaddy/gasket/pull/180
[#216]: https://github.com/godaddy/gasket/pull/216
[#217]: https://github.com/godaddy/gasket/pull/217
[#223]: https://github.com/godaddy/gasket/pull/223
[#225]: https://github.com/godaddy/gasket/pull/225
[#232]: https://github.com/godaddy/gasket/pull/232
[#242]: https://github.com/godaddy/gasket/pull/242
[#243]: https://github.com/godaddy/gasket/pull/243
[#245]: https://github.com/godaddy/gasket/pull/245
[#254]: https://github.com/godaddy/gasket/pull/254
[#263]: https://github.com/godaddy/gasket/pull/263
[#265]: https://github.com/godaddy/gasket/pull/265
[#266]: https://github.com/godaddy/gasket/pull/266
[#274]: https://github.com/godaddy/gasket/pull/274
[#290]: https://github.com/godaddy/gasket/pull/290
[#297]: https://github.com/godaddy/gasket/pull/297
[#302]: https://github.com/godaddy/gasket/pull/302
[#310]: https://github.com/godaddy/gasket/pull/310
[#311]: https://github.com/godaddy/gasket/pull/311
[#320]: https://github.com/godaddy/gasket/pull/320
[#319]: https://github.com/godaddy/gasket/pull/319
[#347]: https://github.com/godaddy/gasket/pull/347
[#366]: https://github.com/godaddy/gasket/pull/366
[#400]: https://github.com/godaddy/gasket/pull/400
[#403]: https://github.com/godaddy/gasket/pull/403
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#451]: https://github.com/godaddy/gasket/pull/451
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
[#491]: https://github.com/godaddy/gasket/pull/491
[#593]: https://github.com/godaddy/gasket/pull/593
[#670]: https://github.com/godaddy/gasket/pull/670
