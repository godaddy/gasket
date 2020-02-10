# `@gasket/plugin-intl`

### 5.1.2

- Fixed missing `await` when saving locales-manifest.json file ([#144])

### 5.0.0

- Open Source Release

### 4.2.0

- Polyfill Intl in node for SSR

### 4.1.0

- Create new apps with `react-intl` as direct dependency

### 4.0.2

- Create new apps with `@gasket/intl@4`

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
