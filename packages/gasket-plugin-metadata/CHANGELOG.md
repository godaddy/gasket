# `@gasket/plugin-metadata`

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

[Loader]:/packages/gasket-resolve/docs/api.md#loader
[PluginInfo]:/packages/gasket-resolve/docs/api.md#plugininfo
[PresetInfo]:/packages/gasket-resolve/docs/api.md#presetinfo
[ModuleInfo]:/packages/gasket-resolve/docs/api.md#moduleinfo
