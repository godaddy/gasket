# @gasket/command-plugin

Enable plugins to inject new commands to be available for use with the
Gasket CLI.

## Overview

Gasket commands extend the [oclif command], with methods allowing
interaction with the Gasket engine. To create a new Gasket command, you must
extend the base [GasketCommand], and implement the `gasketRun` method.

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
config, _before_ [environment overrides] are applied.

The static `id` property, is the name of the command which will be used with
the Gasket CLI in your app. For example `npx gasket my-cmd`. The `description`
property will show up during `npx gasket help`.

In the above example, you can see we are adding a "special" flag which can be
used with this command. Flags are described using the [oclif flags] utility
made available to the [getCommands] lifecycle as described below.
`GasketCommand` instances will have the the [parsed arguments] available as
`this.parsed`.

To make your command available to the CLI, it needs to be returned during the
[getCommands] lifecycle.

## Lifecycles

### getCommands

This lifecycle allows plugins to add commands to the CLI. This hook should
return an extended `GasketCommand` or array of such.

```js
// example-plugin.js
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
      
      return MyCommand;
    }
  }
};
```

In a lifecycle hook, [command details] can be referenced from the gasket
instance, allowing plugins to response to _how_ the lifecycle was invoked.
For example, lets make another plugin that hooks our `example` lifecycle from
the above command.

```js
// another-example-plugin.js
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

GasketCommands

[getCommands]: #getcommands
[GasketCommand]: docs/api.md#gasketcommand
[parsed arguments]: docs/api.md#GasketCommand+parsed
[command details]: docs/api.md#GasketCommand+gasket
[environment overrides]: https://github.com/godaddy/gasket/docs/blob/master/guides/configuration.md#environments

[oclif command]: https://oclif.io/docs/commands.html
[oclif flags]: https://oclif.io/docs/flags
