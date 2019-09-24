# `@gasket/metadata-plugin`

Metadata is the information about the register plugins and presets, available
to plugin lifecycle hooks. This data can be used in various was for plugins,
most notably the [@gasket/docs-plugin] which uses it to collate docs for an app.

## Overview

Metadata begins with the info objects from the `Loader` of [@gasket/resolve]
and builds data objects for [plugins][PluginData], and [presets][PresetData],
and supporting [modules][ModuleData]. Any functions preset will be **redacted**,
as metadata is not intended to be executed, but rather to is made available to
read and inform plugins. This data can be added to, by hooking the [metadata]
lifecycle in a plugin.

Metadata provides insights to a plugin's shape and package information.
Additional [detail info][DetailData] of plugins can added in the [metadata]
lifecycle, such as what commands, lifecycles, or structures, a plugin provides.

## Lifecycles

### metadata

This plugin implements the `metadata` lifecycle, which plugins can use to
modify it's own metadata at runtime. Whatever is returned will replace the
existing metadata.

```js
module.exports = {
  name: 'example',
  hooks: {
    /**
     * @param {Gasket} gasket - The Gasket API
     * @param {PluginData} data - This plugin's initial metadata
     * @returns {Object}
     */
    async metadata(gasket, data) {
      return {
        ...data,
        // adding extra data to this plugin's metadata
        extra: 'information',
        // add metadata for details of this plugin
        lifecycles: [{
          name: 'some-data',
          description: 'Allows plugins to do something with data',
          method: 'exec',
          parent: 'start'
        }]
      }
    },
    /**
     * An example lifecycle hook which utilizes metadata
     *
     * @param {Gasket} gasket - The Gasket API
     */
    async example(gasket) {
      const { metadata } = gasket;

      if (metadata.plugins.find(pluginData => pluginData.name === 'some-plugin')) {
        // only perform some action if a certain plugin is also registered
      }
    }
  }
}
```

<!-- LINKS -->

[metadata]: #metadata
[ModuleData]: docs/api.md#ModuleData
[PluginData]: docs/api.md#PluginData
[PresetData]: docs/api.md#PresetData
[DetailData]: docs/api.md#DetailData

[@gasket/docs-plugin]: /packages/gasket-docs-plugin/README.md
[@gasket/resolve]: /packages/gasket-resolve/README.md
