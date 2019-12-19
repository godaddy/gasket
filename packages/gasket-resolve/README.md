# @gasket/resolve

Essential module resolution and configuration management for Gasket plugins and
presets.

## Guides

- [API docs]

## Installation

```
npm i @gasket/resolve
```

## Naming convention

Plugins and presets should adhere to the project-type prefixed naming
convention. This formatting allows user plugins to be referenced with short
names and will help avoid collisions. This convention also mimics those by other
projects such a `@babel` and `@oclif`.

### Plugins

| scope   | format                          | short             | description                    |
|:--------|:--------------------------------|:------------------|:-------------------------------|
| project | `@gasket/plugin-<name>`         | `@gasket/<name>`  | Official Gasket project plugin |
| user    | `@<scope>/gasket-plugin-<name>` | `@<scope>/<name>` | Any user plugins with a scope  |
| none    | `gasket-plugin-<name>`          | `<name>`          | Any user plugins with no scope |

### Presets

| scope   | format                          | short             | description                    |
|:--------|:--------------------------------|:------------------|:-------------------------------|
| project | `@gasket/preset-<name>`         | `@gasket/<name>`  | Official Gasket project preset |
| user    | `@<scope>/gasket-preset-<name>` | `@<scope>/<name>` | Any user presets with a scope  |
| none    | `gasket-preset-<name>`          | `<name>`          | Any user presets with no scope |

### Fallbacks

To soften the transition of existing apps and plugins using the older postfixed
format, the loader supports fallbacks for short names to postfixed format, and
then to the `@gasket` scope. For example, if a short name of `example` is used,
the package lookup order would be as follows:

```
example --> gasket-plugin-example --> example-gasket-plugin --> gasket/plugin-example --> gasket/example-plugin
```

For project and user scoped short names, the loader will fall-back to postfixed
format as well. For example, if the short name `@user/example` is used:

```
@user/example --> @user/plugin-example --> @user/example-plugin
```

Use with caution, and don't rely on it. Consider this behavior **deprecated**,
which will be removed in a future major release. Short names without the
`@gasket` scope should be presumed to resolve to the `gasket-plugin-<name>`
format.

## Utilities

There are util functions for creating objects for working with different parts
of package identifiers for plugins and presets.

```js
const { pluginIdentifier } = require('@gasket/resolve');

// if given a raw name as full package name with version...
let identifier = pluginIdentifier('@gasket/plugin-example@^1.2.0');

console.log(identifier.longName);   // @gasket/plugin-example
console.log(identifier.shortName);  // @gasket/example
console.log(identifier.version);    // ^1.2.0

// if given a raw name as short name...
identifier = pluginIdentifier('@gasket/example');
console.log(identifier.longName);   // @gasket/plugin-example
console.log(identifier.shortName);  // @gasket/example
console.log(identifier.version);    // null
```

See the [API docs] for more details on the [pluginIdentifier] and
[presetIdentifier] util functions.

## Loading

While this package is mostly intended for gasket project internals, if a plugin
does need to load or resolve modules, a configured [Loader] instance is
available as `gasket.loader` from the engine instance passed as the first
argument to all lifecycle hooks.

```js
// @my/gasket-plugin-example.js

 module.exports = {
  hooks: {
    someLifecycleHook: async function (gasket) {
      const moduleInfo = await gasket.loader.loadModule('@some/package');
      const module = gasket.loader.tryRequire('some-other-package'); 
    }   
  }
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[API docs]:docs/api.md
[Loader]:docs/api.md#Loader
[pluginIdentifier]:docs/api.md#pluginIdentifier
[presetIdentifier]:docs/api.md#presetIdentifier
[PackageIdentifier]:docs/api.md#PackageIdentifier
