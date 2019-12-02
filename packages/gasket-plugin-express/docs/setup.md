# Express Setup Guide

Normally, the Express server that is set up by Gasket plugins should have
everything you need for your application built-in. If you are building a Plugin
for Gasket, or have special requirements to customize your server with
additional routes and middleware, this guide is for you!

Before you go on, make sure you understand [how to author plugins][plugins].
Whether your custom Express middleware is for a plugin to be shared across
multiple apps, or for a standalone plugin used solely by your app, the plugin
system is necessary to do any Express app customization.

After some standard middleware is injected, a plugin can hook the `middleware`
lifecycle and return a middleware or array of middlewares to be added. This hook
is passed the typical `gasket` object as with any hook, and the `express`
instance:

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

The `express` lifecycle is next. This provides an opportunity to do things with
the app object directly, like attaching route handlers:

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

Finally, plugins can hook the `errorMiddleware` lifecycle and return additional
middleware(s), typically for [error handling].

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
middleware injected by another plugin, use the [timing mechanism] of the plugin
engine. For example, if you need your middleware to access the server-side redux
store created by [@gasket/plugin-redux], you can do something like this:

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

<!-- LINKS -->

[error handling]:http://expressjs.com/en/guide/error-handling.html
[plugins]:/packages/gasket-cli/docs/plugins.md
[@gasket/plugin-redux]:/packages/gasket-plugin-redux/README.md
[timing mechanism]:/packages/gasket-engine/README.md
