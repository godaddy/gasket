# Gasket Preset Authoring Guide

## Background

Similar to [babel presets], Gasket presets allow you to group and load common
plugins together. They serve two primary purposes: to serve as codified sets of
plugins and to facilitate the rapid creation of Gasket applications.

At GoDaddy, we have presets specifically tailored with internal sets of plugins,
making it significantly easier to maintain standards around authentication,
style, analytics, and more.

Refer to the [naming conventions] for the best practices in naming a preset,
ensuring that Gasket's plugin engine properly resolves it.

## Composition

The structure of a preset is straightforward. In its most basic form, it should
consist of an index JavaScript file, which can export an empty object, and a
`package.json` file listing the dependencies of Gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "gasket-preset-snl",
  "main": "index.js",
  "dependencies": {
    "plugin-television": "^1.0.0",
    "plugin-live": "^1.0.0",
    "plugin-comedy": "^1.0.0"
  }
}
```

With an `index.js` file like this:

```js
module.exports = {
  require
};
```

While it's recommended but not required, presets can export their `require`
instance. This helps the loader properly resolve plugin dependencies, especially
during development when module linking may be used.

### Predefined Create Context

You can set `gasket create` context values ahead of time in your preset so that
associated prompts are never asked. To do so, in a preset's `index.js`, set the
`createContext` object with the properties you want to define. For instance, in
the following `gasket create` prompt, four questions are asked at the beginning:

```
$ gasket create example --presets gasket-preset-example
✔ Load presets
? What is your app description?
? Which packager would you like to use?
? Choose your unit test suite
? Override contents of example? (y/n) y
```

You can predefine answers to these questions in your preset so that users do not
have to answer them every time.

```js
// index.js
module.exports = {
  require,
  createContext: {
    appDescription: "In a word? .......chaos",
    packageManager: "npm",
    testPlugin: "none",
    destOverride: false
  }
}
```

These specific keys correspond to the prompts shipped internally by the `gasket
create` CLI prompts. Without any extensions, the Gasket CLI provides these
overridable prompts:

- `appDescription` - `String`: Application description placed into
  `package.json.description`.
- `packageManager` - `String`: Package Manager, typically either `npm` or
  `yarn`.
- `testPlugin` - `String`: Specifies which test suite you would like to set up,
  either `mocha`, `jest`, or none.
- `destOverride` - `Boolean`: Determines whether or not to override the contents
  of a directory bearing the same name.

If you want to override further context, you can inspect any plugin with a
`prompt` lifecycle. For example, this plugin implements a `datastore` prompt:

```js
// datastore-plugin/prompt-lifecycle.js
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (!('datastore' in context)) {
    const { datastore } = await prompt([
      {
        name: 'datastore',
        message: 'What is the URL for your datastore?',
        type: 'input'
      }]);

    return { ...context, datastore };
  }

  return context;
}
```

This prompt can be entirely skipped by providing the `datastore` key in a
preset's `createContext`:

```js
// preset-datastore/index.js
module.exports = {
  require,
  createContext: {
    datastore: 'https://store-of-my-data.com'
  }
};
```

### Predefined `gasket.config.js`

Presets can also be used to define predetermined config. This configuration will
be loaded for app-level commands, such as **build** or **start**, and will be
resolved into the generated application's `gasket.config.js`.

```js
// index.js
module.exports = {
  require,
  config: {
    https: {
      port: 8443
    },
    environments: {
      local: {
        http: 3000,
        https: null
      }
    }
  }
}
```

Preset config can also set [environment overrides].

### Extending Other Presets

You can also _extend_ other presets by adding them as dependencies to a parent
preset. For example, by adding:

```diff
{
  "name": "preset-snl",
  "main": "index.js",
  "dependencies": {
    "plugin-television": "^1.0.0",
    "plugin-live": "^1.0.0",
    "plugin-comedy": "^1.0.0"
+   "@tv/preset-episodic": "^45.0.0"
  }
}
```

The plugins from `@tv/preset-episodic` will be registered when the consuming
application is loaded, in addition to the ones already present as
`dependencies`.

[babel presets]: https://babeljs.io/docs/en/presets
[naming conventions]: /packages/gasket-resolve/README.md
[environment overrides]: /packages/gasket-cli/docs/configuration.md
