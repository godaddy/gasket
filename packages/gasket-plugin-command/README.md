# @gasket/plugin-command

This plugin enables other plugins to define and inject custom commands into the
Gasket CLI. It executes the `commands` lifecycle during the `configure` hook,
allowing you to extend the functionality of the Gasket CLI with custom commands.
The plugin utilizes [Commander.js] for command management.

## Installation

```bash
npm i @gasket/plugin-command
```

Update your Gasket configuration to include the plugin:

```diff
import { makeGasket } from '@gasket/core';
+ import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [
    // other plugins
+    pluginCommand
  ]
});
```

---

## Lifecycles

### commands

The `commands` lifecycle is executed during the `configure` hook if the `gasket`
CLI command is present in the `argv`. You can define commands that include
arguments, options, and custom parsing logic.

#### Examples Basic Command

Define a command with a description and an action:

```js
export default {
  name: 'example-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'example-cmd',
        description: 'Example command',
        action: async () => {
          console.log('Hello from example command!');
        }
      };
    }
  }
};
```

Execute the command:

```bash
node ./gasket.js example-cmd
# Output: Hello from example command!
```

---

#### Example Command with Arguments

Add arguments to your command using the `args` array:

```js
export default {
  name: 'example-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'example-cmd',
        description: 'Example command with arguments',
        args: [
          {
            name: 'message',
            description: 'Message to display',
            required: true
          }
        ],
        action: async (message) => {
          console.log('Message:', message);
        }
      };
    }
  }
};
```

Run with arguments:

```bash
node ./gasket.js example-cmd "Hello, World!"
# Output: Message: Hello, World!
```

#### Example Command with Options

```js
export default {
  name: 'example-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'example-cmd',
        description: 'Example command with options',
        options: [
          {
            name: 'message',
            description: 'Message to display',
            required: true,
            short: 'm',
            type: 'string'
          }
        ],
        action: async ({ message }) => {
          console.log('Message:', message);
        }
      };
    }
  }
};
```

Run with options:

```bash
node ./gasket.js example-cmd --message "Hello, World!"
# Output: Message: Hello, World!
```

#### Example Command with Parsing

Use a custom `parse` function to transform option values:

```js
export default {
  name: 'example-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'example-cmd',
        description: 'Example command with parsing',
        options: [
          {
            name: 'list',
            description: 'Comma-separated list of items',
            required: true,
            type: 'string',
            parse: (value) => value.split(',')
          }
        ],
        action: async ({ list }) => {
          console.log('Parsed List:', list);
        }
      };
    }
  }
};
```

Run with parsing:

```bash
node ./gasket.js example-cmd --list "apple,banana,orange"
# Output: Parsed List: [ 'apple', 'banana', 'orange' ]
```

### build

The `build` lifecycle allows plugins to hook into the application's build
process. This lifecycle is triggered by the `build` command in the Gasket CLI.

#### Example

Define a plugin that hooks into the `build` lifecycle:

```js
export default {
  name: 'example-plugin',
  hooks: {
    async build(gasket) {
      console.log('Running custom build logic...');
    }
  }
};
```

Run the `build` command:

```bash
node ./gasket.js build
# Output:
# Running custom build logic...
```

#### Example with JSDoc Types

For type safety, use the `CommandsHook` type:

```js
export default {
  name: 'example-plugin',
  hooks: {
    /** @type {import('@gasket/plugin-command').CommandsHook} */
    commands(gasket) {
      return {
        id: 'example-cmd',
        description: 'Example command',
        args: [
          {
            name: 'message',
            description: 'Message to display',
            required: true
          }
        ],
        action: async (message) => {
          console.log('Message:', message);
        }
      };
    }
  }
};
```

### Command-based Configuration

The commands property in the `gasket.js` file allows you to define configurations that are specific to individual commands. This means that when a particular command is executed, the corresponding configuration values will be applied, ensuring that each command can have its own tailored settings. This helps in managing command-specific behaviors and settings efficiently within your Gasket application.

#### Example

Define a command-based configuration in the `gasket.js` file:

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  message: 'Default message',
  commands: {
    'example-cmd': {
      message: 'Hello, World!' // when the `example-cmd` command is executed, this message will be displayed
    }
  }
});
```

<!-- Links -->
[Commander.js]: https://github.com/tj/commander.js?tab=readme-ov-file#commanderjs
