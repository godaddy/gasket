# @gasket/plugin-command

Enable plugins to inject new commands to be available for use with the Gasket
CLI.

## Installation

This is a default plugin in the Gasket CLI and is always available for use.

## Overview

Gasket commands extend the [oclif command], with methods allowing interaction
with the Gasket engine. To create a new Gasket command, you must extend the base
[GasketCommand], and implement the `gasketRun` method.

```js
class MyCommand extends GasketCommand {

  /**
   * Method requires implementation
   * @override
   */
  async gasketRun() {
    const { special } = this.parsed.flags;
    await this.gasket.exec('example', { special })
  }

  /**
   * Method can optionally overridden to adjust config
   * @param {Object} gasketConfig
   * @returns {Promise<Object>} modified config
   * @override
   */
  async gasketConfigure(gasketConfig) {
    return {
      ...gasketConfig,
      extra: true 
    }
  }
}

MyCommand.id = 'my-cmd';
MyCommand.description = 'My first command which executes the `example` lifecycle';
MyCommand.flags = {
  special: flags.boolean({
    default: false,
    description: 'Is this run particularly special'
  })
};
```

While the `gasketRun` method must be implemented, the `gasketConfigure` method
can be optionally overridden and is available for commands to adjust the Gasket
config.

The static `id` property, is the name of the command which will be used with the
Gasket CLI in your app. For example `npx gasket my-cmd`. The `description`
property will show up during `npx gasket help`.

In the above example, you can see we are adding a "special" flag which can be
used with this command. Flags are described using the [oclif flags] utility made
available to the [getCommands] lifecycle as described below. `GasketCommand`
instances will have the the [parsed arguments] available as `this.parsed`.

To make your command available to the CLI, it needs to be returned during the
[getCommands] lifecycle.

## Lifecycles

### getCommands

This lifecycle allows plugins to add commands to the CLI. This hook should
return an extended `GasketCommand` or array of such.

```js
// gasket-plugin-example.js
module.exports = {
  name: 'example',
  hooks: {
    /**
     * Adds my-cmd to the Gasket CLI
     * 
     * @param {Gasket} gasket - Gasket
     * @param {GasketCommand} GasketCommand - Base Gasket command to extend
     * @param {Object} flags - oclif flag types utility
     * @returns {GasketCommand|GasketCommand[]} command(s)
     */
    getCommands(gasket, { GasketCommand, flags }) {

      class MyCommand extends GasketCommand {

        async gasketRun() {
          const { special } = this.parsed.flags;
          await this.gasket.exec('example', { special });
        }
      }

      MyCommand.id = 'my-cmd';
      MyCommand.description = 'My first command which executes the `example` lifecycle';
      MyCommand.flags = {
        special: flags.boolean({
          default: false,
          description: 'Is this run particularly special'
        })
      };
      
      return [MyCommand];
    }
  }
};
```

In a lifecycle hook, [command details] can be referenced from the Gasket
instance, allowing plugins to response to _how_ the lifecycle was invoked. For
example, lets make another plugin that hooks our `example` lifecycle from the
above command.

```js
// gasket-plugin-another.js
module.exports = {
  name: 'another-example',
  hooks: {
    async example(gasket, { special }) {
      if(special) {
        // do something special
      }
      if(gasket.command.id !== 'my-cmd') {
        // this lifecycle was invoked by some other command
      }
    }
  }
};
```

### init

Signals the start of any Gasket command and allows running of code immediately
before other `gasket` lifecycles. If it errors, the command will exit early.

```js
// gasket-plugin-another.js
module.exports = {
  name: 'another-example',
  hooks: {
    async init(gasket) {
      console.log('init called for command:', gasket.command.id)
    }
  }
};
```

Because this lifecycle runs _before_ for the [configure] lifecycle, only the
partial Gasket config is available (see step 5 below).

### configure

The `configure` lifecycle executes for each Gasket command.

Configuration for a Gasket session goes through a series of steps:

1. Config file loaded by CLI
   - Environment is set
   - Overrides are applied
   - Default plugins (including this) are added
2. Commands adjust config by implementing `gasketConfigure`
3. -_`init` lifecycle is executed_
4. Plugins adjust config by hooking `configure` lifecycle

When the CLI starts up, it attempts to load the `gasket.config` in its default
expected location, or as specified with [command flags]. Plugins then have the
opportunity in the `configure` lifecycle.

```js
// gasket-plugin-example.js
const fetch = require('@gasket/fetch');

module.exports = {
  name: 'example',
  hooks: {
    async configure(gasket, gasketConfig) {
      const { some: { serviceUrl } } = gasketConfig;
      const response = await fetch(serviceUrl);
      const remoteConfig = response.ok ? await response.json() : {};
      return {
        ...gasketConfig,
        ...remoteConfig
      };
    }
  }
};
```

In this example, the plugin hooks the `configure` lifecycle, in order to add
config from a remote service. The `configure` lifecycle is executed with the
[execWaterfall] method, so returning the modified config is necessary.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[getCommands]: #getcommands
[configure]: #configure
[GasketCommand]: docs/api.md#gasketcommand
[parsed arguments]: docs/api.md#GasketCommand+parsed
[command details]: docs/api.md#GasketCommand+gasket
[command flags]: docs/api.md#GasketCommand.flags
[environment overrides]: /packages/gasket-cli/docs/configuration.md
[execWaterfall]: /packages/gasket-engine/README.md#execwaterfallevent-value-args

[oclif command]: https://oclif.io/docs/commands.html
[oclif flags]: https://oclif.io/docs/flags
