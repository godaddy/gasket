# Common "Gotchas"

This section addresses common issues that you might encounter and provides
solutions for dealing with them.

## Errors with `import` or `export` in Certain Files

You may come across the frustrating error message:

> SyntaxError: Unexpected token import

...even though `import` and `export` work fine in some parts of your code. This
issue arises due to the various ways in which your application code is loaded.
Some of it is loaded using Node.js `require` statements, while other parts are
transpiled or bundled by Webpack before being loaded. Generally, only the code
loaded through _page_ entry points (`/pages/**/*.js`) is transpiled to ES5
modules. Files like these and their dependencies should be written as
CommonJS-style modules because they are directly imported by Node.js:

- The Gasket config file (`gasket.config.js`)
- Your store creator (including files it imports, like reducers, action
  constants, etc.), typically `store.js`.
- Lifecycle hooks (`/lifecycles/*.js`)
- Plugins (`/plugins/*.js`)

Apart from ES6 modules, any other Babel-supported features not directly
supported by your Node.js version should also be avoided.

### Use `@babel/register`

If you need to use ES6-style modules for some of your server code, you can
enable ES6 modules in your app code by adding [@babel/register] to your app.
This package will bind itself to Node.js' `require` function and automatically
compile files on the fly.

First, install it in your app:

```bash
npm install @babel/register
```

Then include it at the top of your `gasket.config.js` file:

```diff
// gasket.config.js
+ require('@babel/register');

module.exports = {
  // config goes here
};
```

Requiring `@babel/register` in your `gasket.config.js` ensures that Babel
transpilation starts at the earliest point in the loading process for your app
code. It also ensures that `@babel/register` itself is not included in your
`webpack` bundles.

It's essential to note that your `gasket.config.js` must continue to use
`require` and export using CommonJS syntax (e.g., `module.exports =`). However,
any subsequent files loaded are free to use ES Modules syntax.

Additionally, other special files directly expected by Gasket (e.g., `store.js`,
`/lifecycles/*.js`, or `/plugins/*.js`) must also use CommonJS syntax. This is
because default exports will be transformed to have a `.default` property, which
Gasket plugins may not expect or know how to handle.

For example, if you write `store.js` for [@gasket/plugin-redux] as an ES6
module:

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

When the redux-plugin tries to load this using `require`, it won't know to use
`.default`. Notice how the import of `reducers` was transformed?

So, for these special files, continue to use `module.exports`.

#### Using with `babel-plugin-add-module-exports`

If you want to avoid the `.default` behavior mentioned above, you can use
[babel-plugin-add-module-exports], which will add the `module.exports` if
**only** the export default declaration exists.

⚠️ This approach has not been thoroughly tested, so use it with caution and
report any issues encountered.

```bash
npm install babel-plugin-add-module-exports
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

[@babel/register]: https://babeljs.io/docs/en/babel-register
[babel-plugin-add-module-exports]:
    https://www.npmjs.com/package/babel-plugin-add-module-exports

[@gasket/plugin-redux]:/packages/gasket-plugin-redux/README.md
