# Testing Gasket Plugins and Presets Locally

When modifying plugins or presets, you may want to test your changes locally before merging to the main branch. This guide describes how you can test your plugin or preset changes on your local machine.

**Note:** Presets are deprecated. Prefer testing with `--template-path` and a template package when creating new apps.

## Testing preset changes locally

To test a preset locally, you can create a new Gasket app using `create-gasket-app` and utilize the `--preset-path` flag to specify the absolute path of the local preset you intend to test.

```sh
npx create-gasket-app@latest test-app --preset-path=/absolute/path/gasket/packages/gasket-preset-example
```

This command will create a new Gasket app using your local preset. You can then test your changes by running the app and verifying that your changes work as expected.

## Testing local preset changes with installed plugins

Another way to test a preset locally, but with plugins installed from npm,
is to use the `--presets` flag while specifying the [local paths].

```sh
npx create-gasket-app@latest test-app --presets=gasket-preset-example@file:/absolute/path/gasket/packages/gasket-preset-example
```

## Testing plugin changes locally

Two options for testing your plugin locally are to point a local app's dependencies a the local plugin or to use `pnpm link`.

### Point dependencies to local plugin

To test a Gasket plugin locally, you can modify the plugin dependency in a local Gasket app’s `package.json` to point to the absolute path of the local plugin you want to test. After updating the path, run `pnpm install` to refresh the `node_modules` directory with the local version.

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

## Gotchas for testing presets locally

When testing a preset locally, you might encounter an issue where the local version of a plugin in your preset isn't being used. This occurs because the preset specifies a specific version of the plugin. To resolve this, modify the plugin, as described in the [Testing plugin changes locally] section, to point to the local version instead of the version specified by the preset.

[testing plugin changes locally]: #testing-plugin-changes-locally
[local paths]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#local-paths
