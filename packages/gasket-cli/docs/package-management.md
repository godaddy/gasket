# Package Management Guide

At any stage of app development, you can add new plugins, packages, and
dependencies to your Gasket application. These packages can introduce new
features to your application or modify the way it builds and is configured.

## Installing Dependencies

For example, if you want to install an additional plugin, you can use either of
the following commands. Replace `<plugin-name>` with the actual name of the
plugin. Optionally, you can specify a version with `[@version]`, with `latest`
being the default if not provided. In these examples, the plugin is scoped under
`@gasket`. It could also belong to your own scope or have no scope at all.
Standard modules like `react` or `webpack` are examples of packages without a
scope.

```bash
npm install @gasket/<plugin-name>[@version]
```

OR

```bash
yarn add @gasket/<plugin-name>[@version]
```

If your package or module is only used during development, such as when you need
`stylus` CSS support and want to include `@zeit/next-stylus`, you should add it
as a devDependency. Adding `-D` will make `yarn` or `npm` add the dependency to
`devDependencies`. Alternatively, `-P` and `-O` are available for `peer` or
`optional` dependencies. Refer to the [npm][npm install] or [yarn][yarn install]
install documentation for more details.

```bash
npm install -D <package>
```

OR

```bash
yarn add -D <package>
```

### Symlinking Modules

If you're creating a generic plugin for reuse in your team's projects, you can
symlink it into your application's `node_modules` directory during development.
Run one of the following commands from the plugin/package directory.

```bash
npm link
yarn link
```

Navigate to your Gasket application directory and run one of the following
commands. This will symlink the module from above. Be sure to replace
`<@your-scope/plugin-name>` with the `name` of your module from its
`package.json` file.

```bash
npm link <@your-scope/plugin-name>
yarn link <@your-scope/plugin-name>
```

Note: If you're creating a plugin specific to a single project, it's better to
create a [one-off plugin] in the `plugins/` folder. Additionally, keep in mind
that creating a symlink will not automatically add it to the `package.json`
dependency definitions.

[npm install]: https://docs.npmjs.com/cli/install
[yarn install]: https://yarnpkg.com/en/docs/cli/add#toc-yarn-add-dev-d
[one-off plugin]: plugins.md#one-off-plugins
