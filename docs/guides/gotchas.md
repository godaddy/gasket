# Common "Gotchas"

Here are some common issues that you may run across and how to deal with them.

## Errors with `import` or `export` in certain files

You may run across this dreaded error:

> SyntaxError: Unexpected token import

...despite the fact that in some code, `import` and `export` works fine. This is
caused by varying ways in which your application code is loaded. Some of it is
loaded via node `require` statements, and some of it is transpiled/bundled first
by webpack before being loaded. Generally speaking, only the code that is
loaded through _page_ entry points (`/pages/**/*.js`) is transpiled to ES5
modules. Files like these and their dependencies should be written as
CommonJS-style modules because they're imported directly by node:

* The Gasket config file (`gasket.config.js`)
* Your store creator (including files it imports, like reducers, action
  constants, etc.) - typically `store.js`.
* Your routes creator (if using `next-routes`- typically `routes.js`).
* Lifecycle hooks (`/lifecycles/*.js`)
* Plugins (`/plugins/*.js`)

Besides ES6 modules, any other Babel-supported features that are not directly
supported by your node version should also be avoided.

### Use @babel/register

If you need to use ES6 style modules for some of your server code, you can
enable ES6 modules in your app code by adding [@babel/register] to your app.
This _will bind itself to node's require and automatically compile files
on the fly._

First, install it to your app:

```bash
npm i @babel/register
```

Then include it at the top of your `gasket.config.js`

```diff
// gasket.config.js
+ require('@babel/register');

module.exports = {
  // config goes here
};
```

Requiring `@babel/register` in your `gasket.config.js` will ensure Babel
transpilation begins at the earliest point in the loading process for your app
code. It also ensures that `@babel/register` itself is not included in your
`webpack` bundles.

It is important to note that your `gasket.config.js` must continue to use
`require` and export using CommonJS syntax (e.g. `module.exports =`). Any
subsequent files loaded, however, are free to use ES Modules syntax. 

Additionally, any other special files directly expected by Gasket (e.g. 
`store.js`, `/lifecycles/*.js`, or `/plugins/*.js`) must also use CommonJS
syntax. The reason being is that default exports will be transformed to have
a `.default` property, which Gasket plugins won't be expecting or know how to
handle.

For example, say you write your `store.js` as ES6 module:

```js
// store.js
import { configureMakeStore } from '@gasket/redux';
import reducers from './redux/reducers';

export default configureMakeStore({ reducers });
```

This will be transformed into something like:
```js
'use strict';
const { configureMakeStore } = require('@gasket/redux');
const reducers = require('./redux/reducers').default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = function configureMakeStore({ reducers });
```

When the redux-plugin tries to load this using `require`, it won't know to
use `.default`. See how are reducers import was transformed?

So, for these special files, continue to use `module.exports`.

#### Using with `babel-plugin-add-module-exports`

If you want to get around the `.default` behavior as mentioned above, you can
use [babel-plugin-add-module-exports] which will _add the `module.exports` if
**only** the export default declaration exists._

⚠️This has not been thoroughly tested, however, so proceed with caution and report
back any issues that may have been encounter.

```bash
npm i babel-plugin-add-module-exports
```

```diff
// gasket.config.js
require('@babel/register')({
+  plugins: ['add-module-exports']
});

module.exports = {
  // config goes here
};
```

## `body-parser` not enabled by default

You may encounter middlewares that assume `body-parser` is included earlier in
your middleware chain. This is somewhat common among modules in the `express`
ecosystem since `body-parse` is very commonly used. We don't want Gasket apps
to host full-out APIs (you should have a separately deployed API) so we don't
normally need JSON parsing included.

To work around this simply include it in the handler for the `middleware`
hook. e.g. 

**`/lifecycles/middleware.js`**
```js
const bodyParser = require('body-parser');

/**
 * Introduce new middleware layers to the stack.
 *
 * @param {Gasket} gasket Reference to the gasket instance
 */
module.exports = function middleware(gasket) {
  return bodyParser.json(/* 
    Valid options. See:
    https://github.com/expressjs/body-parser#bodyparserjsonoptions
  */);
};
```

[@babel/register]: https://babeljs.io/docs/en/babel-register
[babel-plugin-add-module-exports]: https://www.npmjs.com/package/babel-plugin-add-module-exports
