# @gasket/plugin-metadata

Metadata is the information about the register plugins and presets, available to
plugin lifecycle hooks. This data can be used in various was for plugins, most
notably the [@gasket/plugin-docs] which uses it to collate docs for an app.

## Installation

This is a default plugin in the Gasket CLI and is always available for use.

## Lifecycles

### metadata

Describe metadata for a plugin and optionally its supporting modules.

#### Example

This plugin implements the `metadata` lifecycle, which plugins can use to modify
its own metadata at runtime. Whatever is returned will replace the existing
metadata.

```js
// gasket-plugin-example.js
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
        }],
        // Metadata for these modules will be loaded
        // Declare as strings or objects with additional data
        modules: [
          'left-pad',
          { name: 'right-pad', extra: 'data', link: 'DOC.md' }
        ]
      }
    },
    /**
     * An example lifecycle hook which utilizes metadata
     *
     * @param {Gasket} gasket - The Gasket API
     */
    async example(gasket) {
      const { metadata } = gasket;

      if (metadata.plugins.find(pluginData => pluginData.name === 'gasket-plugin-something')) {
        // only perform some action if a certain plugin is also registered
      }
    }
  }
}
```

## Usage

Beside the lifecycles available to plugins, metadata can also be described for
preset and modules.

### Presets

Presets can describe additional metadata. This is done by defining a `metadata`
property object on the module, which will get expanded to the [PresetData].

```js
// gasket-preset-example.js
module.exports = {
  require,
  metadata: {
    extra: 'information'
  }
}
```

### Modules

Lastly, modules can describe metadata by defining a `gasket.metadata` property
in the package.json which will get expanded to the [ModuleData]:

```json
{
  "name": "example",
  "version": "1.2.3",
  "gasket": {
    "metadata": {
      "guides": [
        {
          "name": "Example Guide",
          "description": "How to do something",
          "link": "docs/example.md"
        }
      ]
    }
  }
}
```

This is especially useful to surface guides with
[Gasket docs][@gasket/plugin-docs] for supporting packages that are intended to
be used with Gasket, but are not plugins.

## Access

Plugins and apps can read from the [metadata object] by accessing
`gasket.metadata` in most lifecycles.

#### Access example

Back to our example plugin, let's see how we can access details about an
installed module, and put is some conditional logic. 

```js
// gasket-plugin-example.js
const semver = require('semver')

module.exports = {
  name: 'example',
  hooks: {
    // Because metadata is collected during the init lifecycle, we must 
    // adjust our init hook to occur after in order to read the metadata
    init: {
      timing: {
        after: ['@gasket/metadata']
      },
      handler: function initHook(gasket) {
        const { metadata } = gasket;

        // Find the ModuleData for a package
        const moduleData = metadata.modules.find(mod => mod.name === 'some-package');
        
        // If it is installed, and meets requires
        if(moduleData && semver.satisfies(moduleData.version, '13.x')) {
          // Do something special
        } else {
          // Skip and issue warning about upgrading
        }

        // Find the PluginData for a plugin
        const pluginData = metadata.plugins.find(mod => mod.name === 'gasket-plugin-feature');
        if(pluginData) {
          // Fallback for when a certain plugin is not installed
        }
      }
    }
  }
};
```

## How it works

Metadata begins with the info objects from the `Loader` of [@gasket/resolve] and
builds data objects for [plugins][PluginData], and [presets][PresetData], and
supporting [modules][ModuleData]. Any functions preset will be **redacted**, as
metadata is not intended to be executed, but rather to is made available to read
and inform plugins. This data can be added to, by hooking the [metadata]
lifecycle in a plugin.

Metadata provides insights to a plugin's shape and package information.
Additional [detail info][DetailData] of plugins can added in the [metadata]
lifecycle, such as what commands, lifecycles, or structures, a plugin provides.
The [metadata object] be accessed in lifecycle hooks from `gasket.metadata`.

Additionally, [ModuleData] for all the top-level app's dependencies are loaded
by default, and is available from `gasket.metadata.app.modules`. Plugins can
choose to bring in metadata for more modules, or augment what has already been
loaded for the app. These, along with the app's modules, will be flattened and
available from `gasket.metadata.modules`.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[metadata]: #metadata

[ModuleData]: docs/api.md#ModuleData

[PluginData]: docs/api.md#PluginData

[PresetData]: docs/api.md#PresetData

[DetailData]: docs/api.md#DetailData

[metadata object]: docs/api.md#DetailData

[@gasket/plugin-docs]: /packages/gasket-plugin-docs/README.md

[@gasket/resolve]: /packages/gasket-resolve/README.md

[init lifecycle]: /packages/gasket-plugin-command/README.md#init
