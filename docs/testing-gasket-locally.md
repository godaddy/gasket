# Testing Gasket Plugins Locally

When modifying plugins, you may want to test your changes locally before merging to the main branch. This guide describes how you can test your plugin changes on your local machine.

## Testing plugin changes locally

Two options for testing your plugin locally are to point a local app's dependencies at the local plugin or to use `pnpm link`.

### Point dependencies to local plugin

To test a Gasket plugin locally, you can modify the plugin dependency in a local Gasket app's `package.json` to point to the absolute path of the local plugin you want to test. After updating the path, run `pnpm install` to refresh the `node_modules` directory with the local version.

```diff
// package.json
{
  "dependencies": {
-    "@gasket/plugin-example": "^1.0.0"
+    "@gasket/plugin-example": "file:/absolute/path/to/gasket/packages/gasket-plugin-example"
  }
}
```

### Use pnpm link

To test a plugin locally, you can link your plugin to your app using the `pnpm link` command. This will create a symbolic link between your plugin and your app, allowing you to test your plugin locally.

```sh
cd path/to/gasket/packages/gasket-plugin-example
pnpm link

cd path/to/app
pnpm link @gasket/plugin-example
```
