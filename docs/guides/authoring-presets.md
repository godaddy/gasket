# Gasket Preset Authoring Guide

* [What is a preset?](#what-is-a-preset)
* [Naming](#naming)
  * [Good Names](#good-names)
  * [Bad Names](#bad-names)

## What is a preset?

A preset is simply a package with gasket plugins dependencies. Much like
[babel presets] they allow common plugins to be grouped together, and loaded by
way of a preset. Because presets are little more than collections of existing
functionality, they very simply allow developers to codify their opinions

At GoDaddy, we have a preset specifically tailored to an internal set of plugins
so that maintaining standars around auth, styling, internalization, and more
can be easily shipped through a single preset that everyone depends on.

## Naming

`@gasket` presets should follow the naming convention `@gasket/{name}-preset`,
which will allow them to be referenced using [short names](#short-names).
Otherwise, presets need to end with the `-preset` suffix. This is how gasket
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

## How do they work

Brief hand wave into pointing at code

## Are there examples?

<!-- BELOW THIS LINE IS PRIOR ART -->

## Authoring Presets

The anatomy of a preset is very simple. In its most basic form, it should have
an index JavaScript file, which can just export an empty object, and a
package.json file with dependencies of gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "example-preset",
  "main": "index.js",
  "dependencies": {
    "example-plugin": "^1.0.0",
    "@my/other-plugin": "^2.0.0"
  }
}
```

With the `index.js` as:

```js
module.exports = {
  require
}
```

It is recommended, though not required, for presets to export their `require`
instance. This will help the loader properly resolve plugin dependencies,
especially during development when module linking may be used.

### Predefine CreateContext

You can set create context values ahead of time in your preset so that the
associated prompts are never asked. To do so, in a preset's index.js, set the
`createContext` object with the properties you want to define.

```js
// example-preset.js
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

### Predefine Config

Presets can also be used to define predetermined config. This will be loaded
for app-level commands, such as **build** or **start**, yet can be modified
in the app's `gasket.config.js`.

```js
// example-preset.js
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

### Extend other presets

You can also _extend_ other presets by adding them as dependencies to a parent
preset. For example, by adding:

```diff
{
  "name": "example-preset",
  "main": "index.js",
  "dependencies": {
    "example-plugin": "^1.0.0",
    "@my/other-plugin": "^2.0.0",
+    "@some/base-preset": "^3.0.0"
  }
}
```

This base preset's plugins will also be registered when the app loads.

[babel preset]: https://babeljs.io/docs/en/presets
