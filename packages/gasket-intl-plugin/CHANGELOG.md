# `@gasket/intl-plugin`

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
