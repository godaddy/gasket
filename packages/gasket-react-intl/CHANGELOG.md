# `@gasket/react-intl`

### 6.30.0

- Fix to prevent next/router from changing locale in IntlProvider ([#401])

### 6.26.1

- Fix typo for `LocaleStatus` in sample code ([#384])

### 6.26.0

- Update LocaleRequired to accept children and return valid ReactElement ([#380])

### 6.20.4

- Fix types path ([#358])

### 6.0.15

- Support for `locale` from [Next.js i18n routing] ([#278])

### 6.0.10

- Add additional safety checks around accessing gasketData ([#263])

### 6.0.9

- Adjust peerDependencies ([#262])

### 6.0.7

- Add `forwardRef` opt-in option to `withLocaleRequired` ([#260])

### 6.0.2

- Updated react-intl config to return an empty manifest object for testing. ([#251])

### 6.0.0

- Next GSP and GSSP functions support for locale from context or path param. ([#232])
- Expose loading hook as `useLocaleRequired` ([#228])
- Add `initialProps options to enable `getInitialProps` to preload locale files ([#225])
- Use `@gasket/data` for SSR intl content ([#223])
  - Updates for defaultPath property name
- Forward refs from `withLocaleRequired` ([#235])
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

[Next.js i18n routing]: https://nextjs.org/docs/advanced-features/i18n-routing

[#166]: https://github.com/godaddy/gasket/pull/166
[#175]: https://github.com/godaddy/gasket/pull/175
[#180]: https://github.com/godaddy/gasket/pull/180
[#216]: https://github.com/godaddy/gasket/pull/216
[#222]: https://github.com/godaddy/gasket/pull/222
[#223]: https://github.com/godaddy/gasket/pull/223
[#225]: https://github.com/godaddy/gasket/pull/225
[#228]: https://github.com/godaddy/gasket/pull/228
[#235]: https://github.com/godaddy/gasket/pull/235
[#232]: https://github.com/godaddy/gasket/pull/232
[#251]: https://github.com/godaddy/gasket/pull/251
[#260]: https://github.com/godaddy/gasket/pull/260
[#262]: https://github.com/godaddy/gasket/pull/262
[#263]: https://github.com/godaddy/gasket/pull/263
[#278]: https://github.com/godaddy/gasket/pull/278
[#358]: https://github.com/godaddy/gasket/pull/358
[#380]: https://github.com/godaddy/gasket/pull/380
[#384]: https://github.com/godaddy/gasket/pull/384
[#401]: https://github.com/godaddy/gasket/pull/401
