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

### `commands`

The `commands` lifecycle is executed during the `configure` hook if the `gasket`
CLI command is present in the `argv`. You can define commands that include
arguments, options, and custom parsing logic.

#### Examples

##### **Basic Command**

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

##### **Command with Arguments**

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

##### **Command with Options**

Add options to your command using the `options` array:

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

##### **Command with Parsing**

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

### `build`

The `build` lifecycle is used to manage build-related tasks for your Gasket
application. It provides a way to hook into the build process and define custom
build logic. This lifecycle is triggered by the `build` command in the Gasket
CLI.

#### Example

Define a plugin that uses the `build` lifecycle:

```js
export default {
  name: 'example-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'build',
        description: 'Custom build logic for the example plugin',
        action: async () => {
          console.log('Executing custom build task...');
          await gasket.exec('build');
          console.log('Build complete!');
        }
      };
    }
  }
};
```

Run the `build` command:

```bash
node ./gasket.js build
# Output: 
# Executing custom build task...
# Build complete!
```

## **TypeScript Support**

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

<!-- Links -->
[Commander.js]: https://github.com/tj/commander.js?tab=readme-ov-file#commanderjs
