# @gasket/plugin-command

Enable plugins to inject new commands to be available for use with the Gasket
CLI. Executes the `commands` lifecycle in the `configure` hook of the
`@gasket/plugin-command` plugin. This plugin utilizes [Commander.js] and additional documentation can be found in the documentation.

## Installation

```bash
npm i @gasket/plugin-command
```

Update your `gasket.js` plugin configuration:

```diff
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [
    // other plugins
+    pluginCommand
  ]
})
```

## Lifecycles

### Commands

Executed in the `configure` hook of `@gasket/plugin-command` if the `gasket` command is present in the `argv`. The `gasket` command is the CLI execution of the `gasket.js` file.

```js
export default {
  name: 'test-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'test-plugin-cmd',
        description: 'Test plugin',
        action: async () => {
          console.log('test-plugin');
        }
      }
    }
  }
};
```

Commands can be configured with options (flags), arguments, defaults, and parsing functions.

#### Example with arguments

Add arguments to the command by adding an `args` array in the command definition.

```js
export default {
  name: 'test-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'test-plugin-cmd',
        description: 'Test plugin',
        args: [
          {
            name: 'message',
            description: 'Message to display',
            required: true // error if message argument is not provided
          },
          {
            name: 'optional-message',
            description: 'Optional message to display'
          }
        ],
        // Arguments are spread into the action function
        action: async (message, optionalMessage) => {
          console.log('test-plugin', message);
          console.log('test-plugin:optional', optionalMessage);
        }
      }
    }
  }
};
```

Execute the command with the `message` argument.

```bash
node ./gasket.js test-plugin-cmd "Hello, World!"
# result: test-plugin Hello, World!

# Optional message
node ./gasket.js test-plugin-cmd "Hello, World!" "Optional message"
# result: test-plugin Hello, World!
# result: test-plugin:optional Optional message
```

#### Example with options

Add options to the command by adding an `options` array in the command definition.

```js
export default {
  name: 'test-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'test-plugin-cmd',
        description: 'Test plugin',
        options: [
          {
            name: 'message',
            description: 'Message to display',
            required: true, // error if --message option is not provided
            short: 'm',
            type: 'string'
          },
          {
            name: 'optional-message',
            description: 'Optional message to display',
            short: 'op',
            type: 'string'
          }
        ]
        // hyphenated options are camelCased
        action: async ({ message, optionalMessage }) => {
          console.log('test-plugin', message);
          console.log('test-plugin:optional', optionalMessage);
        }
      }
    }
  }
};
```

Execute the command with the `--message` option.

```bash
node ./gasket.js test-plugin-cmd --message "Hello, World!"
# result: test-plugin Hello, World!

# Short option
node ./gasket.js test-plugin-cmd -m "Hello, World!"
# result: test-plugin Hello, World!

# Optional message
node ./gasket.js test-plugin-cmd --message "Hello, World!" --optional-message "Optional message"
# result: test-plugin Hello, World!
# result: test-plugin:optional Optional message
```

#### Example with parsing function

Add a `parse` function to the option to parse the value before it is passed to the action function.

```js
export default {
  name: 'test-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'test-plugin-cmd',
        description: 'Test plugin',
        args: [
          {
            name: 'numberOfItems',
            description: 'Retrieve a number of items from an array',
            required: true // error if message argument is not provided
          }
        ],
        options: [
          {
            name: 'groceryList',
            description: 'List of grocery items',
            required: true,
            type: 'string',
            parse: (value) => value.split(',') // split string to an array
          }
        ],
        // args are spread and options are passed as an object
        action: async (numberOfItems, { groceryList }) => {
          const items = groceryList.slice(0, numberOfItems);
          console.log('test-plugin', items);
        }
      }
    }
  }
};
```

Execute the command with the `--groceryList` option.

```bash
node ./gasket.js test-plugin-cmd 3 --groceryList "apple,banana,orange,grape"
# result: test-plugin [ 'apple', 'banana', 'orange' ]
```

## Example with JSDoc Types

Utilize JSDoc types to provide type checking and documentation for the command arguments and options.

```js
/* @type {import('@gasket/plugin-command').CommandHook} */
commands() {}
```

<!-- Links -->
[Commander.js]: https://github.com/tj/commander.js?tab=readme-ov-file#commanderjs
