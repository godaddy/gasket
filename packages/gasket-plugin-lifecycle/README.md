# @gasket/plugin-lifecycle

Hook Gasket lifecycles using files in a `lifecycles/` directory.

## Installation

This is a default plugin in the Gasket CLI and is always available for use.

## Usage

Create a `lifecycles` (or `src/lifecycles`) folder in the root of your application. This folder should
contain files that can interact with the various of Gasket lifecycles that are
implemented by the plugins.

The name of the file (excluding the `.js` extension) is used as the name of the
lifecycle event and the exported function of that file is used as handler of the
event. So you end up with the following application structure:

```
gasket.config.js
pages/
lifecycles/
  express.js
  middleware.js
  webpack.js
```

In the example above we register to 3 different lifecycle hooks:

- `express`
- `middleware`
- `webpack`

Each of these files export a function that is called when the lifecycle is
executed. For example, for `middleware` the file could look like:

```js
const cors = require('access-control');

/**
 * Introduce new middleware layers to the stack.
 *
 * @param {Gasket} gasket Reference to the gasket instance
 */
module.exports = function middleware(gasket) {
  return cors({
    maxAge: '1 hour',
    credentials: true,
    origins: 'http://example.com'
  });
};
```

It is recommended that you use `kebab-case` or `snake_case` naming conventions
for multi-word lifecycle events to avoid problems with case sensitivity in
different file systems. This plugin will automatically map these to the
`camelCased` event names. For example, `/lifecycles/app-env-config.js` will
properly hook `appEnvConfig` events.

## License

[MIT](./LICENSE.md)
