# @gasket/plugin-dynamic-plugins

Gasket plugin for dynamically adding plugins to Gasket

## Installation

```
npm i @gasket/plugin-dynamic-plugins
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';

 export default makeGasket({
  plugins: [
+   pluginDynamicPlugins
  ]
});
```

## Usage

This plugin gives you the option to dynamically add plugins to Gasket after the core Gasket instance has been created.

This is can be useful when you want to add plugins to Gasket only in specific environments.

For example, if you have plugins for docs creation (`@gasket/plugin-docs`, `@gasket/plugin-docusarus`) that are only needed for development purposes and do not need to be included in your production code, you can dynamically load them into Gasket only when doing development locally through this plugin. You could then add plugins designated only for development to you `devDependencies` in your `package.json` file.

If you want to wait until dynamic plugins have been loaded into the Gasket instance before running app code, you can do so by checking if the `isReady` property on the Gasket instance has been resolved.

```js
import gasket from './gasket.js';
gasket.isReady.then(() => {
  gasket.actions.startServer();
});
```

## Configuration

### Environment Variables

#### `GASKET_DYNAMIC`

The `GASKET_DYNAMIC` environment variable is used to control the loading of dynamic plugins in the Gasket framework. When this variable is set, the framework will attempt to load and register dynamic plugins specified in the configuration.

To enable dynamic plugin loading, set the `GASKET_DYNAMIC` environment variable to `1`.

```json
"docs": "GASKET_DYNAMIC=1 node gasket.js docs"
```

If this variable is not set, the framework will not attempt to load dynamic plugins.

### Gasket Configuration

#### `dynamicPlugins`

To specify which plugin to load dynamically, add a `dynamicPlugins` key to your `gasket` file with a value of an array of strings containing the plugin names you want to add.

```diff
// gasket.js

export default makeGasket({
+  dynamicPlugins: [
+    '@gasket/plugin-foo', 
+    '@gasket/plugin-bar'
+ ]
});
```

## License

[MIT](./LICENSE.md)
