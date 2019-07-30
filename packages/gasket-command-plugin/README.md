# @gasket/command-plugin

Plugin to enable other plugins to inject new gasket commands

## Installing

```shell
npm i --save @gasket/command-plugin
```

...and add to your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    // ...
    add: ['command']
  }
};
```

## Hooks

The following hooks are introduced by this plugin:

### getCommands

A `getCommands` hook should return an Array of [OCLIF command] constructors.
These must have static `id` properties for the name of the commands as well.
The hook is passed the following args:

* gasket - The gasket API
* opts.oclifConfig - The config object from OCLIF
* opts.BaseCommand - The base Gasket command, which your commands may extend

[OCLIF command]: https://oclif.io/docs/commands.html
