# Package Management Guide

At any time during app development you can add new plugins, packages and/or
dependencies. These packages can provide new features to your Gasket application
and/or change the way your application builds or is configured.

## Installing dependencies

For example if you want to install an additional plugin you can run either of
the following commands. Make sure to replace `<plugin-name>` with the actual
name of the plugin. Optionally, you can provide a version through `[@version]`,
otherwise `latest` is installed by default. In the examples the scope of the
plugin is `@gasket`. Similarly this could be your own scope or the package might
have no scope at all. Regular modules like `react` or `webpack` are good
examples of this.

```bash
npm install @gasket/<plugin-name>[@version]
```

OR

```bash
yarn add @gasket/<plugin-name>[@version]
```

If your package/module will only be used during `development`. For example if
you need `stylus` CSS support and want to include `@zeit/next-stylus` you should
add it as a devDependency. Adding `-D` will make `yarn` or `npm` add the
dependency to `devDependencies`. Alternatively, `-P` and `-O` are available for
`peer` or `optional` dependencies. See the [npm][npm install] or
[yarn][yarn install] install documentation for more details.

```bash
npm install -D <package>
```

OR

```bash
yarn add -D <package>
```

### Symlinking modules

If you're creating a generic plugin for reuse in your team's projects, you can
symlink it into your application's `node_modules` directory during development.
Run one of the following commands from the plugin/package directory.

```bash
npm link
yarn link
```

Change to your Gasket application directory and run one of the following
commands. This will symlink the module from above. Make sure to change
`<@your-scope/plugin-name>` to the `name` of your above module in its
`package.json`.

```bash
npm link <@your-scope/plugin-name>
yarn link <@your-scope/plugin-name>
```

Note: If you're creating a plugin that is specific to a single project you're
better of creating a [one-off plugin] in the `plugins/` folder. Also note that
creating a symlink will not automatically add it to the `package.json`
dependency definitions.

[npm install]: https://docs.npmjs.com/cli/install
[yarn install]: https://yarnpkg.com/en/docs/cli/add#toc-yarn-add-dev-d
[one-off plugin]: plugins.md#one-off-plugins
