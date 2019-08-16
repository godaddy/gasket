# `@gasket/metadata-plugin`

Adds additional metadata to `gasket.config`, and is built-in by
default into `@gasket/cli`.

## Hooks

This plugin implements the `metadata` lifecyle, which plugins can use to
modify a plugin's metadata. Whatever is returned will replace the existing metadata

```js
/**
 * @param {Gasket} gasket The Gasket API
 * @param {Object} data default metadata provided to the hook
 */
async function metadataHook(gasket, data) {
  // a list of hooks that this plugin implements
  console.log(data.hooks);

  // flattened data from package.json of this plugin
  console.log(data.name);
  console.log(data.version);
  console.log(data.author);

  // adding extra data to this plugin's metadata
  return {
    ...data,
    extra: 'information'
  }
}
```
