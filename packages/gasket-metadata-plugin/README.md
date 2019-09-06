# `@gasket/metadata-plugin`

Metadata is the information about the register plugins and presets, available
to plugin lifecycle hooks. At its core, metadata for plugins and presets
will consist of the info objects gather by the `Loader` from `@gasket/resolve`.
However, any functions will be **redacted** as metadata is not intended to be
executed, but rather to is made available to read and inform plugins. 

## Lifecycles

#### `metadata`

This plugin implements the `metadata` lifecycle, which plugins can use to
modify it's own metadata at runtime. Whatever is returned will replace the
existing metadata.

```js
module.exports = {
  name: 'example',
  hooks: {
    /**
     * @param {Gasket} gasket - The Gasket API
     * @param {PluginInfo} data - This plugin's initial metadata
     * @returns {Object} 
     */
    async metadata(gasket, data) {
      console.log(data.name);
      console.log(data.version);

      // data from package.json of this plugin
      console.log(data.package.author);
      
      // reach into module content info
      console.log(data.module.hooks);

      // adding extra data to this plugin's metadata
      return {
        ...data,
        extra: 'information'
      }
    },
    /**
     * An example lifecycle hook which utilizes metadata
     * 
     * @param {Gasket} gasket - The Gasket API
     */
    async example(gasket) {
      const { metadata } = gasket;
     
      if( metadata.plugins.find(pluginInfo => pluginInfo.name === 'some-plugin') ){
        // only perform some action if a certain plugin is also registered
      }
    }
  }
}
```
