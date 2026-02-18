# Common "Gotchas"

## `body-parser` not enabled by default

You may encounter middlewares that assume `body-parser` is included earlier in
your middleware chain. This is somewhat common among modules in the `express`
ecosystem since `body-parse` is very commonly used. We don't want Gasket apps
to host full-out APIs (you should have a separately deployed API) so we don't
normally need JSON parsing included.

To work around this simply include it in the handler for the `express`
hook. e.g.

**`example-plugin.js`**
```js
import bodyParser from 'body-parser';

/**
 * Introduce new middleware layers to the stack.
 *
 * @param {Gasket} gasket Reference to the gasket instance
 */
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.use(bodyParser.json(/* 
        Valid options. See:
        https://github.com/expressjs/body-parser#bodyparserjsonoptions
      */));
    }
  }
};
```
