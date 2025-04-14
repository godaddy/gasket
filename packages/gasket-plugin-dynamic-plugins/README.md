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

This plugin gives you the option to dynamically add plugins to Gasket after the
core Gasket instance has been created.

This can be useful when you want to add plugins to Gasket for specific
environments or commands.

For example, if you have plugins that are really only needed for development,
such as (`@gasket/plugin-docs`, `@gasket/plugin-docusarus`), you can dynamically
load them into Gasket only when doing development locally through with plugin.

You could then add plugins designated only for development to you
`devDependencies` in your `package.json` file.

## Configuration

To specify which plugins to load dynamically,
in your `gasket` set the `dynamicPlugins` prop to an array of strings
containing the plugin names you want to add.

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

## Waiting for dynamic plugins

Basic gasket configuration is synchronous, but dynamic plugins will be
loaded asynchronously.

If you want to wait until dynamic plugins have been loaded into the Gasket
instance before running app code or actions, you can do so by checking if the
`isReady` property on the Gasket instance has been resolved.

```diff
export default {
  name: 'example-plugin',
  actions: {
    async myAction(gasket) {
+      await gasket.isReady;
      // do something async after dynamic plugins have been loaded
    }
  }
};
```

## How it works

This plugin hooks the [prepare] lifecycle to add dynamic plugins to the Gasket instance.

In the `prepare` hook, plugins specified in the `dynamicPlugins` configuration
are registered with the Gasket instance.
The `init`, `configure`, and `prepare` lifecycles are then executed exclusively
for the newly added dynamic plugins.

## License

[MIT](./LICENSE.md)

[environments]: ../../docs/configuration.md#environments
[commands]: ../../docs/configuration.md#commands
[prepare]: ../gasket-core/README.md#prepare
