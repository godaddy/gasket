# `create-gasket-app`

### 7.0.6

- Add JSDoc Typechecking to create-gasket-app ([#943])

### 7.0.2

- Add packageJson `type` type ([#936])

### 7.0.0

- See [Version 7 Upgrade Guide] for overall changes
- Exclude gaskets from client bundling ([#806])
- Modified global test prompt to ask for unit and integration tests ([#752])
- Force `GASKET_ENV` to create
- Add preset lifecycles `presetPrompt` and `presetConfig` ([#736])
- ESM refactor, package is now type module
- Gasket apps default to `type: module`
- Update the `load-preset` functionality
- Remove `addPlugins` utility
- Change the implementation of `gasket` usage to `makeGasket`
- Remove obsolete files
- Remove references to `@gasket/resolve`
- Remove `plugins`, `bootstrap` & `generate` flags
- Adjust prompt flag to `no-prompt`
- Remove plugin start references
- Adjust default plugins to remove lifecycle, metadata & start plugins
- Adjust `CreateContext` properties
- Add several methods to the `ConfigBuilder`
- Remove `setup.js` getopts script
- Update `writeGasketConfig` to write in ESM
- Update tests

### 6.46.6

- Fix resolve cli path ([#712])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.17.1

- Update relative path from `__dirname` ([#337])

### 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

### 5.6.2

- Fix bug with additional arguments ([#171])

### 5.6.0

- Introducing `create-gasket-app` ([#167])


[Version 7 Upgrade Guide]: /docs/upgrade-to-7.md
[#167]: https://github.com/godaddy/gasket/pull/167
[#171]: https://github.com/godaddy/gasket/pull/171
[#247]: https://github.com/godaddy/gasket/pull/247
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#712]: https://github.com/godaddy/gasket/pull/712
[#736]: https://github.com/godaddy/gasket/pull/736
[#752]: https://github.com/godaddy/gasket/pull/752
[#806]: https://github.com/godaddy/gasket/pull/806
[#936]: https://github.com/godaddy/gasket/pull/936
[#943]: https://github.com/godaddy/gasket/pull/943
