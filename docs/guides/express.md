# Custom Express Middleware/Routes Guide

Normally, the express server that is set up by gasket should have everything you
need for your application built-in. The main use case for a gasket application
is for it to be purely responsible for serving up an application front-end. If
you want to build a web API, we recommend that it lives as a service that
is separate from your application. See the
[Slay](https://github.com/godaddy/slay) project for help in creating a
well-structured API.

If you are building a plugin for gasket, or have special requirements to
customize your gasket server with additional routes and middleware, this guide
is for you!

Before you go on, make sure you understand
[how to author plugins](plugins.md).
Whether your custom express middleware is for a plugin to be shared across
multiple apps, or for a standalone plugin used solely by your app, the plugin
system is necessary to do any express app customization.

A typical gasket-based application relies on
[`@gasket/plugin-nextjs`](/packages/gasket-nextjs-plugin#gasketplugin-nextjs) and
[`@gasket/plugin-express`](/packages/gasket-plugin-express)
for creating the web servers and Express application.

After some standard middleware is injected, a plugin can hook the `middleware`
event and return a middleware or array of middlewares to be added. This hook
is passed the typical `gasket` object as with any hook, and the `express` app:

```js
const someMiddleware = require('some-middleware');
const anotherMiddleware = require('another-middleware');

// Sample plugin
module.exports = {
  hooks: {
    middleware(gasket, app) {
      return [
        someMiddleware({ some: 'options' }),
        anotherMiddleware(app)
      ];
    }
  }
};
```

The `express` event is next. This provides an opportunity to do things with the
app object directly, like attaching route handlers:

```js
// Sample plugin
module.exports = {
  hooks: {
    express(gasket, app) {
      app.param('id', require('./form-id-handler'));
      app.post('/submit/:id', require('./handle-form-submits'));
    }
  }
};
```

Finally, after the built-in next.js handler is inserted, plugins can hook the
`errorMiddleware` event and return additional middleware(s), typically
[error handlers](http://expressjs.com/en/guide/error-handling.html) since
the next.js handler is a catch-all handler.

```js
const errorLoggingClient = require('some-error-logger');

// Sample plugin
module.exports = {
  hooks: {
    errorMiddleware(gasket, app) {
      return async (err, req, res, next) => {
        try {
          await errorLoggingClient.logError(err, req);
          next();
        } catch (loggingError) {
          next(loggingError);
        }
      };
    }
  }
};
```

Remember, if you need any of your injected middleware to come before or after
middleware injected by another plugin, use the
[timing mechanism](/packages/gasket-plugin-engine)
of the plugin engine. For example, if you need your middleware to access
the server-side redux store created by
[`@gasket/plugin-redux`](/packages/gasket-redux-plugin#gasketplugin-redux),
you can do something like this:

```js
const getFeatureFlags = require('./get-feature-flags');

module.exports = {
  dependencies: ['@gasket/redux'],
  hooks: {
    middleware: {
      timing: {
        after: ['@gasket/redux']
      },
      handler(gasket, app) {
        return async (req, res, next) => {
          try {
            const flags = await getFeatureFlags({
              userId: req.userId,
              locale: req.cookies.market
            });
            req.store.dispatch({
              type: 'SET_FEATURE_FLAGS',
              payload: { flags }
            });
            next();
          } catch (err) {
            next(err);
          }
        }
      }
    }
  }
}
```
