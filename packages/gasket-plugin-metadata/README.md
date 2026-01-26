# @gasket/plugin-metadata

Metadata is the information about the registered plugins, available to
plugin lifecycle hooks. This data can be used in various ways for plugins, most
notably the [@gasket/plugin-docs] which uses it to collate docs for an app.

## Installation

This is a default plugin in newly create Gasket apps.

## Actions

### getMetadata

Get all the metadata for the configured plugins and modules.

```js
const metadata = await gasket.actions.getMetadata();
```

## Lifecycles

### metadata

Describe metadata for a plugin and optionally its supporting modules.

#### Example

This plugin implements the `metadata` lifecycle, which plugins can use to modify
its own metadata at runtime. Whatever is returned will replace the existing
metadata.

```js
// gasket-plugin-example.js
export default {
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
          {
            name: 'module-name',
            version: '7.0.0',
            description: 'module-name description',
            link: 'README.md'
          }
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
modules.

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

Plugins and apps can read from the [metadata object] by using
the `getMetadata` Gasket action.

#### Access example

Back to our example plugin, let's see how we can access details about an
installed module, and put in some conditional logic.

```js
// gasket-plugin-example.js
import semver from 'semver';

export default {
  name: 'example',
  hooks: {
    // We need access to metadata during build
    async build(gasket) {
      const metadata = await gasket.actions.getMetadata()
      // ... use metadata
    }
  }
};
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[ModuleData]: docs/api.md#moduledata

[metadata object]: docs/api.md#detaildata

[@gasket/plugin-docs]: /packages/gasket-plugin-docs/README.md
