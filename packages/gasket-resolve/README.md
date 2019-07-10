# @gasket/resolve

Essential module resolution & configuration management for gasket plugins & presets.

## Usage

**@gasket/any-preset**
``` js
// index.js
module.exports = require('@gasket/resolve/plugins')({
  dirname: __dirname,
  resolve: name => require(name)
});
```

```
BRAIN DUMP
module.exports = require('@gasket/resolve/plugins')({
  dirname: __dirname,
  resolve: name => require(name)
  // extends: [
  //   '@gasket/pwa-preset',
  //   '/omg/i/need/to/npm/link/from/over/here/@gasket/whatever-preset',
  //   require('@gasket/pwa-preset')
  // ]
});

```

## API Documentation

### `resolvePlugins({ dirname, resolve }`

``` js
const { resolvePlugins } = require('@gasket/resolve');
const resolvePlugins = require('@gasket/resolve/plugins');

console.log(resolvePlugins({
  dirname: __dirname,
  resolve: name => require(name)
}))
```

Responds with an Array of plugin information (i.e. a "preset").

### Preset data structure

The data structure generated for a preset is a combination of the
`package.json` dependencies and the `preset.json` manifest file. For example,
consider `@gasket/some-plugin` that is  required by `@gasket/any-preset` as:

``` js
"dependencies": {
  "@gasket/some-plugin": "^1.1.0"  
}
```

with the following `preset.json`:

``` js
{
  'some-plugin': {
    'arbitrary': 'default config values',
    'consumed': 'by the plugin',
    'these': 'can be overriden',
    'in your': 'gasket.config.js'
  }
}
```

This would get transformed into the following by `@gasket/resolve/plugins`:

``` js
{
  required: module,               // `require`d plugin material.
  from: '@gasket/default-preset', // Preset that included this plugin.
  range: '^1.1.0',                // Semver range it was included at.
  shortName: 'some',              // Convenient short name.
  name: '@gasket/some-plugin',    // Full npm package name.
  config: {                       // Config read from preset.json.
    'arbitrary': 'default config values',
    'consumed': 'by the plugin',
    'these': 'can be overriden',
    'in your': 'gasket.config.js'
  }
}
```

### `new Resolver({ resolveFrom, resolve })`

Manages resolution operations for plugins and presets.

``` js
const { Resolver } = require('@gasket/resolve');
const Resolver = require('@gasket/resolve/resolve');

const resolver = new Resolver({
  resolveFrom: `${__dirname}/node_modules`,
  resolve: name => require(name)
});

// Resolve a plugin
resolver.pluginFor('short-name');

// Resolve a preset
resolver.presetFor('short-name');
```

##### LICENSE: [MIT](./LICENSE)
