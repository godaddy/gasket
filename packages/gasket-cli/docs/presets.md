# Gasket Preset Authoring Guide

## Background

Much like [babel presets], Gasket presets allow common plugins to be grouped and
loaded together. They serve 2 purposes: to serve as codified sets of plugins,
and to facilitate rapid creation of Gasket application.

At GoDaddy, we have presets specifically tailored with internal sets of plugins,
making maintaining standards around authentication, style, analytics, and more
significantly easier.

See the [naming conventions] for how to best name a preset, ensuring that
Gasket's plugin engine properly resolves it.

## Composition

The anatomy of a preset is very simple. In its most basic form, it should have
an index JavaScript file, which can just export an empty object, and a
`package.json` file with dependencies of Gasket plugins.

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

With an `index.js` as:

```js
module.exports = {
  require
};
```

It is recommended, though not required, for presets to export their `require`
instance. This will help the loader properly resolve plugin dependencies,
especially during development when module linking may be used.

### Predefined create context

You can set `gasket create` context values ahead of time in your preset so that
the associated prompts are never asked. To do so, in a preset's `index.js`, set
the `createContext` object with the properties you want to define. For example,
in the following `gasket create` prompt, 4 questions are asked at the beginning.

```
$ gasket create example --presets gasket-preset-example
✔ Load presets
? What is your app description?
? Which packager would you like to use?
? Choose your unit test suite
? Override contents of example? (y/n) y
```

You can enumerate pre-defined answers to these questions in your preset so that
users do not have to answer these questions every time.

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

These particular keys come from inspecting the prompts shipped internally by
`gasket create` CLI prompts. Without any extensions, the Gasket CLI ships
these overridable prompts:

- `appDescription` - `String`
  - Application desciption placed into `package.json.description`
- `packageManager` - `String`
  - Package Manager, typically either `npm` or `yarn`
- `testPlugin` - `String`
  - What test suite you would like to setup, either `mocha`, `jest`, or none
- `destOverride` - `Boolean`
  - Whether or not to override the contents of a directory bearing the same name

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

Presets can also be used to define predetermined config. This will be loaded
for app-level commands, such as **build** or **start**, and will resolve into
the generated application's `gasket.config.js`.

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

### Extending other presets

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

`@tv/preset-episodic`'s plugins will be registered when the consuming
application is loaded, in addition to the ones already present as `dependencies`.

[babel presets]: https://babeljs.io/docs/en/presets
[naming conventions]: /packages/gasket-resolve/README.md
[environment overrides]: /packages/gasket-cli/docs/configuration.md
