# `@gasket/plugin-intl`

### 6.0.0

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
