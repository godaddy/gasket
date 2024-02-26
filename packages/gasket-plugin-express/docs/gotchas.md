# Common "Gotchas"

## `body-parser` not enabled by default

You may encounter middlewares that assume [body-parser] is included earlier in
your middleware chain. This is somewhat common among modules in the Express
ecosystem since `body-parser` is very commonly used.

When using Gasket for Next.js webapps, this is generally unnecessary to have.
However, if using Gasket for an Express API, you may encounter this issue.

The fix is to simply include it in the handler for the `middleware` hook. e.g.

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

[body-parser]: https://github.com/expressjs/body-parser
