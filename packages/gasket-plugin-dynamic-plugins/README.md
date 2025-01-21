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

To specify which plugins to load dynamically, add a `dynamicPlugins` key to your `gasket` file with a value of an array of strings containing the plugin names you want to add.

```diff
// gasket.js

export default makeGasket({
+  dynamicPlugins: [
+    '@gasket/plugin-foo', 
+    '@gasket/plugin-bar',
+    './custom-plugin.js'
+ ]
});
```

### Conditional configuration

You can use sub-configurations by [environments] or [commands] to determine
which plugins to load dynamically.

For example, if you wanted to load docs-related plugins only when using the
docs commands, with a package script like:

```json
  "docs": "node gasket.js docs"
```

In your `gasket` file, you would then configure the plugins to load dynamically
when the `docs` command is used.

```js
makeGasket({
  // ...
  commands: {
    'docs': {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        '@gasket/plugin-metadata'
      ]
    }
  }
})
```

## How it works

This plugin hooks the [prepare] lifecycle to add dynamic plugins to the Gasket instance.

In the `prepare` hook, plugins specified in the `dynamicPlugins` configuration
are registered to the Gasket instance.
The `init`, `configure`, and `prepare` lifecycles are then executed exclusively
for the newly added dynamic plugins.

## License

[MIT](./LICENSE.md)

[environments]: ../../docs/configuration.md#environments
[commands]: ../../docs/configuration.md#commands
[prepare]: ../gasket-core/README.md#prepare
