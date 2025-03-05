# `@gasket/plugin-webpack`

## 7.3.0

### Minor Changes

- 29f72a5: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 7.1.0

- Aligned version releases across all packages

## 7.0.15

- Fix dynamic require warning ([#985])

## 7.0.7

- Update to `getWebpackConfig` `WebpackContext` param ([#955])

## 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Add plugin import to gasket file ([#736])
- Add itself to the app package file

## 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

## 6.34.3

- Upgrade mocha v10 ([#442])

## 6.24.2

- Fix invalid lifecycle names which was causing the lifecycle diagram to get a syntax error. ([#376])

## 6.20.1

- Fix migration links

## 6.19.0

- Deprecating webpack-merge smart approaches ([#346])

## 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

## 6.8.2

- Fix lazy require `initWebpack` dependencies ([#303])

## 6.6.0

- Created new webpackConfig lifecycle ([#284])

## 6.0.3

- Install webpack 5 as a dev dependency by default ([#252])

## 6.0.0

- Remove node config defaults to support webpack 5 ([#221])
- Upgraded dev dependencies ([#247])

## 5.0.0

- Open Source Release

## 1.1.1

- Fix package.json scripts to wrap glob patterns in double-quotes

## 1.1.0

- Align package structure and dependencies

## 1.0.1

- Separate webpack plugin from core
- Initial release.

[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#221]: https://github.com/godaddy/gasket/pull/221
[#247]: https://github.com/godaddy/gasket/pull/247
[#252]: https://github.com/godaddy/gasket/pull/252
[#284]: https://github.com/godaddy/gasket/pull/284
[#303]: https://github.com/godaddy/gasket/pull/303
[#311]: https://github.com/godaddy/gasket/pull/311
[#376]: https://github.com/godaddy/gasket/pull/376
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#736]: https://github.com/godaddy/gasket/pull/736
[#955]: https://github.com/godaddy/gasket/pull/955
[#985]: https://github.com/godaddy/gasket/pull/985
