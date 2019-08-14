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
  constants, etc).
* Your routes creator (if using `next-routes`).
* Lifecycle hooks (`/lifecycles/*.js`)
* Plugins (`/plugins/*.js`)

Besides ES6 modules, any other babel-supported features that are not directly
supported by your node version should also be avoided.

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