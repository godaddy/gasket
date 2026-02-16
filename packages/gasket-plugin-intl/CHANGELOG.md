# `@gasket/plugin-intl`

## 7.6.4

### Patch Changes

- fdd8860: Avoid **dirname and **filename const names
  - @gasket/request@7.5.5

## 7.6.3

### Patch Changes

- 217acaa: React 19 & NextJS 16

## 7.6.2

### Patch Changes

- 31bf06b: Upgrade glob (v8→v13) and rimraf (v3→v6) dependencies.
  - @gasket/request@7.5.5

## 7.6.1

### Patch Changes

- db09b09: Improve JSDocs
- Updated dependencies [db09b09]
  - @gasket/request@7.5.5

## 7.6.0

### Minor Changes

- 7d1d8bf: Remove createRequire & new URL of package.json files
- 9b1bb5b: ESM port

### Patch Changes

- @gasket/request@7.5.4

## 7.5.10

### Patch Changes

- 0d1c0a0: Fix broken intl.js locale paths when locales are in a subdir

## 7.5.9

### Patch Changes

- f5e6942: Include EXAMPLES.md when publishing
- 9d86fd2: Updated documentation
- da18ea5: Add code examples
- Updated dependencies [f5e6942]
- Updated dependencies [d794a98]
- Updated dependencies [da18ea5]
  - @gasket/request@7.5.4

## 7.5.8

### Patch Changes

- f2ff987: Tune eslint9 configs
- Updated dependencies [f2ff987]
  - @gasket/request@7.5.3

## 7.5.7

### Patch Changes

- 5d38a2e: Eslint version 9
- Updated dependencies [5d38a2e]
  - @gasket/request@7.5.2

## 7.5.6

### Patch Changes

- Updated dependencies [84fd13d]
  - @gasket/request@7.5.1

## 7.5.5

### Patch Changes

- Updated dependencies [660cf7a]
  - @gasket/request@7.5.0

## 7.5.4

### Patch Changes

- Updated dependencies [8a7d6d7]
  - @gasket/request@7.4.4

## 7.5.3

### Patch Changes

- 8dba71e: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [8dba71e]
  - @gasket/request@7.4.3

## 7.5.2

### Patch Changes

- Updated dependencies [9a98fd0]
  - @gasket/request@7.4.2

## 7.5.1

### Patch Changes

- Updated dependencies [39e41cb]
  - @gasket/request@7.4.1

## 7.5.0

### Minor Changes

- 30833cb: add generated code for vitest and include vitest plugin in dependencies

### Patch Changes

- Updated dependencies [30833cb]
  - @gasket/request@7.4.0

## 7.4.2

### Patch Changes

- Updated dependencies [63ba7ba]
- Updated dependencies [63ba7ba]
  - @gasket/request@7.3.6

## 7.4.1

### Patch Changes

- e7ee793: Fix apmTransaction hook to use GasketActions
- eb403a8: Audit ts-ignores.
- Updated dependencies [eb403a8]
  - @gasket/request@7.3.5

## 7.4.0

### Minor Changes

- cc6b554: upgrade to react 19 and nextjs 15

### Patch Changes

- @gasket/request@7.3.4

## 7.3.3

### Patch Changes

- b667c4e: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [b667c4e]
  - @gasket/request@7.3.4

## 7.3.2

### Patch Changes

- 7812607: Updates to support using syncpack.
- Updated dependencies [7812607]
  - @gasket/request@7.3.3

## 7.3.1

### Patch Changes

- 41e5c6d: Remove Catalog and Workspace alias usage.
- 0561cd5: Updates to use user-selected package manager. Update all packages to use catalog dep versions.
- Updated dependencies [41e5c6d]
- Updated dependencies [0561cd5]
  - @gasket/request@7.3.1

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [29f72a5]
  - @gasket/request@7.3.0

## 7.1.3

- Replace `@hapi/accept` with `negotiator` ([#1006])

## 7.1.0

- Use normalized GasketRequest ([#973])

## 7.0.14

- Tune getIntlManager to import intl.js ([#975])
- Add json assertion to dynamic import
- Add ESM flag to jest for dynamic import
- Add config for experimental import attributes

## 7.0.7

- add `defaultLocale` to created Gasket TS config ([#965])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add gasket actions ([#791])

## 6.46.4

- Fix for missing manifest paths ([#701])

## 6.46.3

- Only config webpack with add env vars for server bundles ([#696])

## 6.46.0

- Fix to nested module.localesDir lookup ([#676])
- Add support for specific module packages and subdirectory configure ([#676])

## 6.45.2

- Remove `eslint-plugin-mocha` & `setup-env` ([#670])
- Support debug logging under namespace `gasket:plugin:intl:*`

## 6.38.7

- Add missing runtime dependency to the package.json ([#593])

## 6.35.1

- Add option to preload locales file ([#491])

## 6.34.5

- Upgrade fs-extra to v10 ([#467])

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade react-intl to v6 ([#451])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.30.1

- Fix middleware hook handler ([#403])

## 6.30.0

- Add `apmTransaction` hook ([#400])

## 6.24.0

- Add Fastify support ([#366])

## 6.19.0

- Migrate `webpack` -> `webpackConfig` lifecycle ([#347])

## 6.16.1

- Fix to not polyfill intl for node >= 14 ([#336])

## 6.11.2

- Use fs.promises ([#319])

## 6.11.1

- Reduce bad accept-language log to `debug` level ([#320])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.8.3

- Ability to disable Next.js Intl Routing when configuring `locales` ([#310])

## 6.8.2

- Handle malformed and inconsistent formatted accept-language header ([#302])

## 6.7.2

- Minor fix to update logger to use `gasket.logger.warning` ([#297])

## 6.5.2

- Handle/log accept.language exceptions ([#290])

## 6.0.12

- Improve logging for missing locale files and manifest write errors ([#274])

## 6.0.10

- Add additional safety checks around accessing gasketData ([#263])
- Fix to use configured intl.localesDir for serving static files ([#265])
- Safer base path config selection ([#266])

## 6.0.4

- Fix to use defaultPath in workbox lifecycle ([#254])

## 6.0.0

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

## 5.7.0

- Create new apps with `react-intl` v5 ([#175])

## 5.5.0

- Updated plugins to consume zones gasket config property ([#166])

## 5.1.2

- Fixed missing `await` when saving locales-manifest.json file ([#144])

## 5.0.0

- Open Source Release

## 4.2.0

- Polyfill Intl in node for SSR

## 4.1.0

- Create new apps with `react-intl` as direct dependency

## 4.0.2

- Create new apps with `@gasket/react-intl@4`

## 4.0.1

- Fix `initReduxState` from stomping over existing state

## 4.0.0

- Execute `intlLanguage` lifecycle to determine language
- Set `intl.language` on redux state instead of market cookie
- Migrated to monorepo
- Align package structure and dependencies

## 3.1.2

- Use url-join package to resolve assetPrefix paths

## 3.1.1

- Allow `@gasket/log-plugin@3`
- Fix security audit failures
- Fix babel configuration

## 3.1.0

- Precache locale files with Workbox

## 3.0.0

- Uses `assetPrefix` from plugin config for CDN support
  - Removes use of `apiBase`
- Provides `req.localesDir` for outputDir from plugin config
- Moves locale file endpoint to `/_locales` with better cache control headers

## 2.0.0

- Depend on `@gasket/*` 2.0 packages for Next & Babel 7 support.

## 1.1.0

- Add files from `@gasket/app-template`.

## 1.0.0

- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
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
[#676]: https://github.com/godaddy/gasket/pull/676
[#696]: https://github.com/godaddy/gasket/pull/696
[#701]: https://github.com/godaddy/gasket/pull/701
[#791]: https://github.com/godaddy/gasket/pull/791
[#965]: https://github.com/godaddy/gasket/pull/965
[#975]: https://github.com/godaddy/gasket/pull/975
[#973]: https://github.com/godaddy/gasket/pull/973
[#1006]: https://github.com/godaddy/gasket/pull/1006
