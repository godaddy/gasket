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

## Middleware not intercepting requests due to plugin order

Express processes its middleware stack in registration order. If your plugin
uses the `express` hook to register general middleware (e.g. logging, auth,
compression), it must be registered **before** route handlers. Because Gasket
fires `express` hooks in the order plugins appear in `gasket.ts`, placing your
plugin after a routes plugin means your middleware never runs — the route
handler responds first and Express stops processing the stack.

**Wrong** — `pluginMyMiddleware` fires after routes, so it never intercepts requests:

```ts
// gasket.ts
plugins: [pluginRoutes, pluginMyMiddleware]
```

**Option 1 — Use `timing: { first: true }` in your plugin** (recommended):

This guarantees your hook always runs first regardless of plugin array order,
making it impossible for consumers to misconfigure this accidentally.

```js
// my-middleware-plugin.js
export default {
  name: 'my-middleware-plugin',
  hooks: {
    express: {
      timing: { first: true },
      handler(gasket, app) {
        app.use(myMiddleware());
      }
    }
  }
};
```

**Option 2 — Order plugins correctly in `gasket.ts`**:

If you control the app (not a reusable plugin), ensure middleware plugins come
before route plugins in the `plugins` array:

```ts
// gasket.ts
plugins: [pluginMyMiddleware, pluginRoutes]
```

### Timing reference

| `timing` value | When the hook runs |
|---|---|
| `{ first: true }` | Before all other `express` hooks |
| `{ last: true }` | After all other `express` hooks |
| `{ before: ['plugin-name'] }` | Before a specific plugin's hook |
| `{ after: ['plugin-name'] }` | After a specific plugin's hook |
