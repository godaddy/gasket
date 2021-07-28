# `@gasket/plugin-nextjs`

### 6.5.1

- Updated default .babelrc to only set modules: 'commonjs' for the test env.
  ([#289])

### 6.4.0

- Upgrade to next@^10.2 ([#285]).

### 6.0.10

- Safer base path config selection ([#266])

### 6.0.9

- Adjust peerDependencies ([#262])

### 6.0.7

- Ensure NextJS catchall route for pages is registered last ([#257])

### 6.0.3

- Create gasket.config.js with nextConfig for future webpack5  ([#252])

### 6.0.0

- Add public/ to structure metadata for docs index ([#245])
- Fix to only add i18n to next config if locales array set ([#243])
- Fix timing to add react dep before intl plugin ([#243])
- Fix missing deps and peer dep versions ([#243])
- No longer support old version of Next.js build and next-routes ([#240])
- Configures `next` as `nextConfig` with deprecation warning ([#232])
- Force sets the `NEXT_LOCALE` cookie if locale predetermine by Intl plugin
  ([#232])
- Generate new apps with `GasketData` script injecting to `_document.js`
  ([#223])
- Generate `pages/_app.s` with [next-redux-wrapper] setup from store ([#173])
- Generate a `redux/store.js` with [next-redux-wrapper] setup ([#173])
- Change `zone` config to `basePath` ([#212])
- Update next@10 and react@17 dependencies ([#216])

### 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

### 5.3.1

- Configure server worker plugin to inject registration script to _app entry
  ([#158])

### 5.0.2

- Fix name in plugin timing ([#136])

### 5.0.0

- Open Source Release
- Generate `_app.js` for Redux integration ([#125])
- Move test framework generated content ([#114])

### 2.3.3

- Bump to `next@9.1.2` to fix hanging `gasket build` ([#97])
- Tune for `react/destructuring-assignment` from Airbnb style ([#98])

### 2.3.2

- Fix package.json scripts to wrap glob patterns in double-quotes

### 2.3.0

- Support `gasket.command` interface change ([#75])

### 2.2.0

- Use `next@9` for new apps

### 2.1.0

- Align package structure and dependencies

### 2.0.2

- [#33] Add required dependencies during `gasket create`

### 2.0.1

- [#32] Do not build with `gasket local` command

### 2.0.0

- [#23] Dismantling core-plugin

### 1.1.1

- Fix for missing dependency during create command

### 1.1.0

- Renaming hooks and removing the `webpack` hook
- Separate next plugins from core
- Initial release.

<!-- LINKS -->

[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper

[#23]: https://github.com/godaddy/gasket/pull/23
[#32]: https://github.com/godaddy/gasket/pull/32
[#33]: https://github.com/godaddy/gasket/pull/33
[#75]: https://github.com/godaddy/gasket/pull/75
[#97]: https://github.com/godaddy/gasket/pull/97
[#98]: https://github.com/godaddy/gasket/pull/98
[#114]: https://github.com/godaddy/gasket/pull/114
[#125]: https://github.com/godaddy/gasket/pull/125
[#136]: https://github.com/godaddy/gasket/pull/136
[#158]: https://github.com/godaddy/gasket/pull/158
[#166]: https://github.com/godaddy/gasket/pull/166
[#173]: https://github.com/godaddy/gasket/pull/173
[#212]: https://github.com/godaddy/gasket/pull/212
[#216]: https://github.com/godaddy/gasket/pull/216
[#223]: https://github.com/godaddy/gasket/pull/223
[#232]: https://github.com/godaddy/gasket/pull/232
[#240]: https://github.com/godaddy/gasket/pull/240
[#243]: https://github.com/godaddy/gasket/pull/243
[#245]: https://github.com/godaddy/gasket/pull/245
[#252]: https://github.com/godaddy/gasket/pull/252
[#257]: https://github.com/godaddy/gasket/pull/257
[#262]: https://github.com/godaddy/gasket/pull/262
[#266]: https://github.com/godaddy/gasket/pull/266
[#285]: https://github.com/godaddy/gasket/pull/285
[#289]: https://github.com/godaddy/gasket/pull/289
