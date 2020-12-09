# `@gasket/react-intl`

### 6.0.0

- Renamed from `@gasket/intl` ([#222])
- Decoupled from Redux ([#180])
- Support for getStaticProps and getServerSideProps in Next.js apps ([#180])
  - Removed use of getInitialProps in components.
- Simplified locale paths (formerly referred to as "identifiers") ([#180])
- Update next@10 and react@17 dependencies ([#216])

### 5.7.0

- Bump `react-intl` peerDependency range to include v5 ([#175])

### 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

### 5.4.0

- Expose loadLocaleFilesIntoStore

### 5.0.0

- Open Source Release

### 4.2.1

- Fix package.json scripts to wrap glob patterns in double-quotes

### 4.2.0

- Select language from state for IntlProvider

### 4.1.0

- Move `react-intl` to `peerDependencies` to allow app version choice
- Drop use `intlShape` to facilitate upgrades to `react-intl@3`

### 4.0.1

- Adjust peer dependencies for v4

### 4.0.0

- Uses intl.language from redux state instead of market cookie
- Migrated to monorepo
- Align package structure and dependencies

### 3.2.0

- Support upgrades of react-redux

### 3.1.4

- Fix IE11 compatibility issue

### 3.1.3

- Remove redux as direct dependency

### 3.1.2

- Don't read locale files if no req.localeDir

### 3.1.1

- Don't read locale manifest if no req.localeDir

### 3.1.0

- Exposing `selectMessage` selectors for use outside of IntlProvider.

### 3.0.0

- Uses `assetPrefix` from plugin config for CDN support
  - Removes use of `apiBase`
- SSR loads files from `req.localesDir` for outputDir from plugin config
- Adds caching of locale files during SSR to avoid repeated file reads

### 2.0.0

- Upgrade to Babel 7 and `@babel/*` namespace packages.
- Upgrade to latest `@gasket/*` packages that have upgraded as well.

### 1.2.0

- Switch to Reduxful

[#166]: https://github.com/godaddy/gasket/pull/166
[#175]: https://github.com/godaddy/gasket/pull/175
[#180]: https://github.com/godaddy/gasket/pull/180
[#216]: https://github.com/godaddy/gasket/pull/216
[#222]: https://github.com/godaddy/gasket/pull/222
