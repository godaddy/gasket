# Gasket Preset Authoring Guide

> **Deprecation:** Presets are deprecated for app creation. Use [templates](https://github.com/godaddy/gasket/tree/main/packages/create-gasket-app#templates) instead when creating new Gasket apps with `create-gasket-app`. This guide remains for teams still using presets.

## Background

Presets are used to provide configuration and prompting to facilitate app generation using `create-gasket-app`.

At GoDaddy, we have presets specifically tailored with internal sets of plugins,
making maintaining standards around authentication, style, analytics, and more
significantly easier.

See the [recommended naming conventions] for how to best name a preset.

## Create a Gasket app using presets

To create a new Gasket app using a preset, use the `--preset` flag with `create-gasket-app`:

```sh
npx create-gasket-app@latest <app-name> --presets <@your/gasket-preset-example>
```

## Composition

The anatomy of a preset is very similar to a [plugin]. Presets take `name`, `version`, `description`, and `hooks` properties.  

One major difference is that presets can use two preset-specific hooks: `presetPrompt` and `presetConfig`.

```js
// my-preset/index.js
import { createRequire } from 'module';
import presetPrompt from './preset-prompt.js';
import presetConfig from './preset-config.js';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

export default {
  name,
  version,
  description,
  hooks: {
    presetPrompt,
    presetConfig
  }
};
```

### presetPrompt hook

The `presetPrompt` hook prompts users for any additional information not provided by the preset's plugins. It also allows you to predefine values used by plugins in the `prompt` or `create` hooks.

This hook is invoked before the `presetConfig` hook and before all other plugin hooks that are included with the preset.

The `presetPrompt` hook is an async function that takes three arguments: `gasket`, `context`, and `utils` object containing a `prompt` function.

```js
/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  // Add additional configuration or prompts
}
```

You can add values to the context object to be used by other plugins.

```js
// vegan-preset/prompt-preset.js

export default async function presetPrompt(gasket, context, { prompt }) {
  context.sandwichMeat = 'none'; // Predefined value to be used in sandwich-plugin
}

// sandwich-plugin/prompt.js

export async function promptMeat(gasket, context) {
  // Will not prompt for meat if predefined in context
  if !('sandwichMeat' in context){
    // Prompt for sandwich meat
  }
}

async function prompt(gasket, context) {
  await promptMeat(gasket, context);
  // Prompt for other sandwich ingredients
}
```

Additional prompts can be added by using the `prompt` function provided in the `utils` object. Prompts can also be imported from other plugins if you want to change the order in which those prompts are asked.

```js
// vegan-preset/prompt-preset.js

import sandwichPrompts from 'sandwich-plugin/prompts';

export default async function presetPrompt(gasket, context, { prompt }) {
  await sandwichPrompts.promptBreadType(context, prompt);
  await sandwichPrompts.promptVeggies(context, prompt);

  if (!('sandwichCheeseType' in context)) {
    const { sandwichCheeseType } = await prompt([
      {
        name: 'sandwichCheeseType',
        message: 'Do you want cheese?',
        type: 'list',
        choices: [
          { name: 'Vegan Cheese 1', value: 'v-1' },
          { name: 'Vegan Cheese 2', value: 'v-2' },
          { name: 'No Cheese', value: 'none' }
        ]
      }
    ]);

    Object.assign(context, { sandwichCheeseType });
  }
}
```

### presetConfig hook

The `presetConfig` is used to add all plugins that will be used in your gasket app and it also gives you the option to add configuration to the `gasket` object.

This hook is called after the `presetPrompt` hook and before all other plugin hooks in the preset.

The `presetConfig` hook is an async function that takes two arguments: `gasket` and `context`. The `context` object contains all the values that were set in the `presetPrompt` hook.

```js
/**
 * presetConfig hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @returns {Promise<CreateContext.presetConfig>} config
 */
export default async function presetConfig(gasket, context) {
  // Add plugins and configuration
}
```

To enable Gasket to utilize the hooks in your plugins, ensure that all plugins are included in the plugins array within the returned `presetConfig` object.

Any properties you add to the `presetConfig` object will be added to the `gasket` object in your generated `gasket.js` file.

```js
// my-preset/preset-config.js

import pluginFoo from '@gasket/plugin-foo';
import pluginBar from '@gasket/plugin-bar';

export default async function presetConfig(gasket, context) {
  const myConfigObject = {
    my: 'value'
  }

  return {
    additionalProperty: myConfigObject,
    plugins: [
      pluginFoo
      pluginBar
    ]
  };
}

// Generated gasket.js file

import pluginFoo from '@gasket/plugin-foo';
import pluginBar from '@gasket/plugin-bar';

export default makeGasket({
  plugins: [
    pluginFoo,
    pluginBar
  ],
  additionalProperty: {
    my: 'value'
  }
});
```

### Adding configuration through the command line

You can also add configuration to the `context` object through the command line by using `create-gasket-app` with the `--config` flag, followed by a stringified object containing the values you wish to add.

```sh
npx create-gasket-app@latest <app-name> --presets <@your/gasket-preset-example> --config "{\"my\": \"value\"}"
```

[recommended naming conventions]: /docs/authoring-plugins.md#recommended-naming-convention
[plugin]: /docs/authoring-plugins.md
