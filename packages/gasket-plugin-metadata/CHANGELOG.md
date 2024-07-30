# `@gasket/plugin-metadata`

### 6.46.4

- Adjust JSDocs and TS types ([#695])

### 6.41.1

- Docs on accessing `gasket.metadata` ([#613])

### 6.39.2

- Add missing `ConfigurationsData` type ([#597])

### 6.36.0

- Add missing `configurations` property to plugin metadata type ([#498])

### 6.35.0

- Fix package object type ([#489])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

### 5.1.0

- Clean markdown from jsdocs ([#141])

### 5.0.0

- Open Source Release

### 2.0.0

- Allow presets to define metadata
- Metadata is assigned to gasket instance, and only by this plugin ([#64])
  - Uses [Loader] from Gasket instance to get [PluginInfo] and [PresetInfo] data
  - `gasket.metadata` structure matches loaded infos with functions redacted
- Load [ModuleInfo] for main app

### 1.0.0

- [#51] Initial implementation
  - Adds `package.json` and hooks to each `gasket.config.metadata`
  - Implements the `metadata` lifecycle


[#51]: https://github.com/godaddy/gasket/pull/51
[#64]: https://github.com/godaddy/gasket/pull/64
[#141]: https://github.com/godaddy/gasket/pull/141
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#436]: https://github.com/godaddy/gasket/pull/436
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#489]: https://github.com/godaddy/gasket/pull/489
[#498]: https://github.com/godaddy/gasket/pull/498
[#597]: https://github.com/godaddy/gasket/pull/597
[#613]: https://github.com/godaddy/gasket/pull/613
[#695]: https://github.com/godaddy/gasket/pull/695

[Loader]:/packages/gasket-resolve/docs/api.md#loader
[PluginInfo]:/packages/gasket-resolve/docs/api.md#plugininfo
[PresetInfo]:/packages/gasket-resolve/docs/api.md#presetinfo
[ModuleInfo]:/packages/gasket-resolve/docs/api.md#moduleinfo
