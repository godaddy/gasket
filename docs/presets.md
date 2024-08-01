# Gasket Preset Authoring Guide

## Background

Much like [babel presets], Gasket presets allow common plugins to be grouped and
loaded together. They serve 2 purposes: to serve as codified sets of plugins,
and to facilitate rapid creation of Gasket application.

At GoDaddy, we have presets specifically tailored with internal sets of plugins,
making maintaining standards around authentication, style, analytics, and more
significantly easier.

See the [naming conventions] for how to best name a preset, ensuring that
Gasket's plugin engine properly resolves it.

## Composition

The anatomy of a preset is very simple. In its most basic form, it should have
an index JavaScript file, which can just export an empty object, and a
`package.json` file with dependencies of Gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "gasket-preset-snl",
  "main": "index.js",
  "dependencies": {
    "plugin-television": "^1.0.0",
    "plugin-live": "^1.0.0",
    "plugin-comedy": "^1.0.0"
  }
}
```

With an `index.js` as:

```js
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

### Predefined create context

You can set `create-gasket-app` context values ahead of time in your preset so that
the associated prompts are never asked. To do so, in a preset's `preset-prompt.js`, set
the values on the `context` object with the properties you want to define.

You can enumerate pre-defined answers to these questions in your preset so that
users do not have to answer these questions every time in the `preset-prompt.js`.

```js
// preset-prompt.js
export default async function presetPrompt(gasket, context, { prompt }) {
  context.example = "value";
}
```

If you want to override further context, you can inspect any plugin with a
`prompt` lifecycle. For example, this plugin implements a `datastore` prompt:

```js
// datastore-plugin/prompt-lifecycle.js
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (!('datastore' in context)) {
    const { datastore } = await prompt([
      {
        name: 'datastore',
        message: 'What is the URL for your datastore?',
        type: 'input'
      }]);

    return { ...context, datastore };
  }

  return context;
}
```

This prompt can be entirely skipped by providing the `datastore` key in a
preset's `createContext`:

```js
// preset-datastore/preset-prompt.js
export default async function presetPrompt(gasket, context, { prompt }) {
  context.datastore: 'https://store-of-my-data.com'
}
```

[babel presets]: https://babeljs.io/docs/en/presets
[naming conventions]: /docs/plugins.md#naming-convention
