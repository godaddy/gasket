# Gasket Preset Authoring Guide

* [Background?](#background)
* [Naming](#naming)
  * [Good Names](#good-names)
  * [Bad Names](#bad-names)
* [Composition](#composition)

## Background

A preset is simply a package with Gasket plugins dependencies. Much like
[babel presets] they allow common plugins to be grouped together, and loaded by
way of a preset. Because presets are little more than collections of existing
functionality, they very simply allow developers to codify their opinions

At GoDaddy, we have presets specifically tailored to internal sets of plugins,
making maintaining standards around auth, styling, internalization, and more
significantly easier.

## Naming

`@gasket` presets should follow the naming convention `@gasket/preset-{name}`,
which will allow them to be referenced using [short names](#short-names).
Otherwise, presets need to start with the `preset-` prefix. This is how Gasket
determines what packages are presets or not.

#### Good names

```
@gasket/preset-example
preset-example
@myscope/preset-example
```

#### Bad names

These will **not** be resolved as valid presets.

```
@gasket/example
example
@myscope/example
```

## Composition

The anatomy of a preset is very simple. In its most basic form, it should have
an index JavaScript file, which can just export an empty object, and a
`package.json` file with dependencies of Gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "preset-snl",
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

### Predefined `gasket create` context

You can set `gasket create` context values ahead of time in your preset so that
the associated prompts are never asked. To do so, in a preset's `index.js`, set
the `createContext` object with the properties you want to define. For example,
in the following `gasket create` prompt, 3 questions are asked at the beginning.

```
$ gasket create example --presets nextjs
✔ Load presets
? What is your app description?
? Which packager would you like to use?
? Choose your unit test suite
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
    testPlugin: "none"
  }
}
```

These particular keys come from inspecting the prompts shipped internally by
[`gasket create`](cli prompts). Without any extensions, the Gasket CLI ships
these prompts which you can override:

- `appDescription`
  - `String`
  - Application desciption placed into package.json.description`
- `packageManager`
  - `String`
  - Package Manager, typically either npm or yarn
- `testPlugin`
  - `String`
  - What test suite you would like to setup, either mocha, jest, or none
- `destOverride`
  - `Boolean`
  - Whether or not to override the contents of a directory bearing the same name

If you want to override further context you inspect any plugin with a `prompt`
lifecycle. For example this prompts:

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

Can be overridden in a preset by providing the `datastore` key in `createContext`:

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
for app-level commands, such as **build** or **start**, yet can be modified
in the app's `gasket.config.js`.

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

Preset config can also set environment overrides. <!-- TODO: what the heck is this -->

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

`@tv/preset-episodic`'s plugins will also be registered when the consuming
application is loaded.

[babel preset]: https://babeljs.io/docs/en/presets
[cli prompts]: https://github.com/godaddy/gasket/blob/master/packages/gasket-cli/src/scaffold/actions/global-prompts.js
