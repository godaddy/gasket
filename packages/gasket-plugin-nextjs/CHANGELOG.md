# `@gasket/plugin-nextjs`

## 8.0.0-next.3

### Patch Changes

- 4aaacd0: Update fastify to use v5 and use adapters

## 8.0.0-next.2

### Patch Changes

- a92c7ed: upgrade to next 16

## 8.0.0-next.1

### Patch Changes

- ed9a857: Remove plugins: redux, manifest, service-worker & workbox
- d99ffaf: remove create only plugins and create, prompt, postcreate hooks
- ed9a857: ESM only exports
- Updated dependencies [ed9a857]
- Updated dependencies [d99ffaf]
- Updated dependencies [ed9a857]
  - @gasket/plugin-webpack@8.0.0-next.1

## 8.0.0-next.0

### Major Changes

- b235fc1: bump all package majors to 8

### Patch Changes

- Updated dependencies [b235fc1]
  - @gasket/plugin-webpack@8.0.0-next.0

## 7.7.2

### Patch Changes

- db09b09: Improve JSDocs
  - @gasket/plugin-webpack@7.4.0

## 7.7.1

### Patch Changes

- 38c31a9: Dependency updates

## 7.7.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- e899e2e: Add webpack functionality to remove Node apis from webpack bundles
- Updated dependencies [7d1d8bf]
- Updated dependencies [9b1bb5b]
  - @gasket/plugin-webpack@7.4.0

## 7.6.4

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- d794a98: convert testing framework in esm packages to vitest
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [da18ea5]
  - @gasket/plugin-webpack@7.3.9

## 7.6.3

### Patch Changes

- f2ff987: Tune eslint9 configs
- Updated dependencies [f2ff987]
  - @gasket/plugin-webpack@7.3.8

## 7.6.2

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/plugin-webpack@7.3.7

## 7.6.1

### Patch Changes

- Updated dependencies [871b8fe]
  - @gasket/plugin-webpack@7.3.6

## 7.6.0

### Minor Changes

- 660cf7a: Update CJS transpilation to use @gasket/cjs

### Patch Changes

- @gasket/plugin-webpack@7.3.5

## 7.5.6

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/plugin-webpack@7.3.5

## 7.5.5

### Patch Changes

- 9a98fd0: - Better windows OS support when using create-gasket-app
  - Updated create-gasket-app docs to include @latest dist tag
  - @gasket/plugin-webpack@7.3.4

## 7.5.4

### Patch Changes

- 2b90013: Fixed isExpressApp function to check for the correct "function" type.

## 7.5.3

### Patch Changes

- 388c23f: Updates to allow dynamically generating scripts and commands for npm, yarn, and pnpm instead of being hardcoded to specific package managers.

## 7.5.2

### Patch Changes

- 116aa96: Fix local script watcher
  - @gasket/plugin-webpack@7.3.4

## 7.5.1

### Patch Changes

- c456fba: bump dependencies
  - @gasket/plugin-webpack@7.3.4

## 7.5.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- @gasket/plugin-webpack@7.3.4

## 7.4.4

### Patch Changes

- 63ba7ba: Adjustments to types
- 0c8f998: Opt for node bin over tsx
- 63ba7ba: Fix GasketRequest does not export a url prop
  - @gasket/plugin-webpack@7.3.4

## 7.4.3

### Patch Changes

- 3abfe68: Document environment variable
- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/plugin-webpack@7.3.4

## 7.4.2

### Patch Changes

- a490392: Ensure create hook runs before docusaurus plugin
  - @gasket/plugin-webpack@7.3.3

## 7.4.1

### Patch Changes

- d5ee612: The nextConfig lifecycle hooks can be async
- ea983c6: Adjust peer dep ranges for next and react versions

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

### Patch Changes

- @gasket/plugin-webpack@7.3.3

## 7.3.5

### Patch Changes

- 0e54d9d: Set reactIntlPkg in CreateContext to be used by templates.

## 7.3.4

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/plugin-webpack@7.3.3

## 7.3.3

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/plugin-webpack@7.3.2

## 7.3.2

### Patch Changes

- 721e8ad: Bump next.js version to latest patch to mitigate critical vulnerability.

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/plugin-webpack@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/plugin-webpack@7.3.0

## 7.2.3

- Await gasket.isReady to allow async configurations to be prepared ([#1035])

## 7.1.6

- Auto exclude gasket.mjs files from webpack bundle ([#1017])

## 7.1.0

- Add HTTPS proxy server to Next.js dev server ([#982])

## 7.0.5

- Fix typo in dir names ([#948])

## 7.0.4

- Add app type readme links in create ([#946])
- Make Custom Server default prompt choice

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add gasketData layout for app router ([#814])
- Exclude gaskets from client bundling ([#806])
- Convert cjs sitemap config to esm ([#798])
- Added useAppRouter optional flag ([#777])
- Convert store.js to esm ([#799])
- Fix logic for `server.js` generation to include `customServer` ([#778])
- Update generated `_document.js` ([#778])
- Added redux optional flag ([#762])
- Add plugin import to gasket file ([#736])
- Add itself to the app package file ([#736])
- Add generator files `next.config.js` & `server.js` ([#736])
- Add `nextDevProxy` prompt for proxy server to Next.js dev server ([#736])
- Remove `@gasket/resolve` dependency ([#736])
- Plugin is `typescript` aware
- Add Prompt for `nextServerType`
- Removed support for deprecated `next` config support ([#655])
- With Redux, generate \_app with example `getInitialAppProps` ([#693])

## 6.47.0

- Check if headers sent from lifecycle ([#750])

## 6.46.7

- (fix) Handle malformed URL segments in Elastic APM transaction labeling ([#724])
- (fix) Omit query parameters when parsing next.js route labels ([#724])

## 6.46.4

- Adjust JSDocs and TS types ([#695])

## 6.46.1

- Adjust generated page tests for initial flexibility ([#678])
- Use `req.path` instead of `req.url` in path matching in `getNextRoute` ([#679])

## 6.45.2

- Add `peerDeps` ([#670])

## 6.43.0

- Upgrade to Next.js 13.1.1 ([#614])

## 6.38.2

- Fix generated Mocha example test ([#556])

## 6.38.0

- Update Cypress examples to v12 ([#541])

## 6.35.0

- Prompt to add `next-sitemap` during create ([#479])
- Upgrade `react` and `react-dom` to v18 ([#463])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade next-redux-wrapper to v8 ([#443])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.33.1

- Fix for port fallback ([#433])
- Use level "warning" not "warn" with logger ([#445])

## 6.32.0

- Fix syntax that is not node 14 compatible ([#407])
- Add `nextPreHandling` lifecycle ([#411])
- Next.js Middleware Support ([#413])
- Configuring cache dir for deployments ([#416])

## 6.30.1

- Lazy load next package ([#403])

## 6.30.0

- Add a `getNextRoute` function to requests ([#400])
- Add an `apmTransaction` hook
- Support for Fastify ([#398])

## 6.21.0

- Support for scaffolded cypress tests ([#357])

## 6.17.1

- Update glob path from `__dirname` ([#337])

## 6.16.0

- Updates to support not generating a .babelrc file when creating new apps ([#334])

## 6.13.0

- Default next-redux-wrapper to v7 for new Gasket apps with Next + Redux ([#326])

## 6.12.0

- Replaced enzyme with React Testing Library. ([#324])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.8.3

- Ability to disable Next.js Intl Routing when configuring `locales` ([#310])

## 6.6.0

- Created new webpackConfig lifecycle ([#284])

## 6.5.1

- Updated default .babelrc to only set modules: 'commonjs' for the test env.
  ([#289])

## 6.4.0

- Upgrade to next@^10.2 ([#285]).

## 6.0.10

- Safer base path config selection ([#266])

## 6.0.9

- Adjust peerDependencies ([#262])

## 6.0.7

- Ensure NextJS catchall route for pages is registered last ([#257])

## 6.0.3

- Create gasket.config.js with nextConfig for future webpack5 ([#252])

## 6.0.0

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

## 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

## 5.3.1

- Configure server worker plugin to inject registration script to \_app entry
  ([#158])

## 5.0.2

- Fix name in plugin timing ([#136])

## 5.0.0

- Open Source Release
- Generate `_app.js` for Redux integration ([#125])
- Move test framework generated content ([#114])

## 2.3.3

- Bump to `next@9.1.2` to fix hanging `gasket build` ([#97])
- Tune for `react/destructuring-assignment` from Airbnb style ([#98])

## 2.3.2

- Fix package.json scripts to wrap glob patterns in double-quotes

## 2.3.0

- Support `gasket.command` interface change ([#75])

## 2.2.0

- Use `next@9` for new apps

## 2.1.0

- Align package structure and dependencies

## 2.0.2

- [#33] Add required dependencies during `gasket create`

## 2.0.1

- [#32] Do not build with `gasket local` command

## 2.0.0

- [#23] Dismantling core-plugin

## 1.1.1

- Fix for missing dependency during create command

## 1.1.0

- Renaming hooks and removing the `webpack` hook
- Separate next plugins from core
- Initial release.

[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper
[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
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
[#284]: https://github.com/godaddy/gasket/pull/284
[#310]: https://github.com/godaddy/gasket/pull/310
[#311]: https://github.com/godaddy/gasket/pull/311
[#324]: https://github.com/godaddy/gasket/pull/324
[#326]: https://github.com/godaddy/gasket/pull/326
[#334]: https://github.com/godaddy/gasket/pull/334
[#337]: https://github.com/godaddy/gasket/pull/337
[#357]: https://github.com/godaddy/gasket/pull/357
[#398]: https://github.com/godaddy/gasket/pull/398
[#400]: https://github.com/godaddy/gasket/pull/400
[#403]: https://github.com/godaddy/gasket/pull/403
[#407]: https://github.com/godaddy/gasket/pull/407
[#411]: https://github.com/godaddy/gasket/pull/411
[#413]: https://github.com/godaddy/gasket/pull/413
[#416]: https://github.com/godaddy/gasket/pull/416
[#433]: https://github.com/godaddy/gasket/pull/433
[#436]: https://github.com/godaddy/gasket/pull/436
[#445]: https://github.com/godaddy/gasket/pull/445
[#442]: https://github.com/godaddy/gasket/pull/442
[#443]: https://github.com/godaddy/gasket/pull/443
[#460]: https://github.com/godaddy/gasket/pull/460
[#463]: https://github.com/godaddy/gasket/pull/463
[#479]: https://github.com/godaddy/gasket/pull/479
[#541]: https://github.com/godaddy/gasket/pull/541
[#556]: https://github.com/godaddy/gasket/pull/556
[#614]: https://github.com/godaddy/gasket/pull/614
[#655]: https://github.com/godaddy/gasket/pull/655
[#670]: https://github.com/godaddy/gasket/pull/670
[#678]: https://github.com/godaddy/gasket/pull/678
[#679]: https://github.com/godaddy/gasket/pull/679
[#695]: https://github.com/godaddy/gasket/pull/695
[#693]: https://github.com/godaddy/gasket/pull/693
[#724]: https://github.com/godaddy/gasket/pull/724
[#736]: https://github.com/godaddy/gasket/pull/736
[#750]: https://github.com/godaddy/gasket/pull/750
[#762]: https://github.com/godaddy/gasket/pull/762
[#777]: https://github.com/godaddy/gasket/pull/777
[#778]: https://github.com/godaddy/gasket/pull/778
[#798]: https://github.com/godaddy/gasket/pull/798
[#799]: https://github.com/godaddy/gasket/pull/799
[#806]: https://github.com/godaddy/gasket/pull/806
[#814]: https://github.com/godaddy/gasket/pull/814
[#946]: https://github.com/godaddy/gasket/pull/946
[#948]: https://github.com/godaddy/gasket/pull/948
[#982]: https://github.com/godaddy/gasket/pull/982
[#1017]: https://github.com/godaddy/gasket/pull/1017
[#1035]: https://github.com/godaddy/gasket/pull/1035
