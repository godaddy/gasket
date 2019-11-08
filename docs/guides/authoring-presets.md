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

`@gasket` presets should follow the naming convention `@gasket/{name}-preset`,
which will allow them to be referenced using [short names](#short-names).
Otherwise, presets need to end with the `-preset` suffix. This is how Gasket
determines what packages are presets or not.

#### Good names

```
@gasket/example-preset
example-preset
@myscope/example-preset
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
`package.json` file with dependencies of gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "snl-preset",
  "main": "index.js",
  "dependencies": {
    "television-plugin": "^1.0.0",
    "live-plugin": "^1.0.0",
    "comedy-plugin": "^1.0.0"
  }
}
```

With the `index.js` as:

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
the `createContext` object with the properties you want to define.

```js
// index.js
module.exports = {
  require,
  createContext: {
    appDescription: "In a word? .......chaos",
    packageManager: "npm",
    gitInit: false,
    testPlugin: "none"
  }
}
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

Preset config can also set environment overrides.

### Extending other presets

You can also _extend_ other presets by adding them as dependencies to a parent
preset. For example, by adding:

```diff
{
  "name": "snl-preset",
  "main": "index.js",
  "dependencies": {
    "television-plugin": "^1.0.0",
    "live-plugin": "^1.0.0",
    "comedy-plugin": "^1.0.0"
+   "@tv/episodic-preset": "^45.0.0"
  }
}
```

`@tv/episodic-preset`s plugins will also be registered when the consuming
application is loaded.

[babel preset]: https://babeljs.io/docs/en/presets
