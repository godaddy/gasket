# `@gasket/metadata-plugin`

- Metadata is assigned to gasket instance, and only by this plugin ([#64])
  - Uses [Loader] from gasket instance to get [PluginInfo] and [PresetInfo] data
  - `gasket.metadata` structure matches loaded infos with functions redacted

# 1.0.0

- [#51] Initial implementation
  - Adds `package.json` and hooks to each `gasket.config.metadata`
  - Implements the `metadata` lifecycle

[#51]: https://github.com/godaddy/gasket/pull/51
[#64]: https://github.com/godaddy/gasket/pull/64

[Loader]:/packages/gasket-resolve/README.md#Loader
[PluginInfo]:/packages/gasket-resolve/README.md#PluginInfo
[PresetInfo]:/packages/gasket-resolve/README.md#PresetInfo
