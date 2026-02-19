# Express Setup Guide

Normally, the Express server that is set up by Gasket plugins should have
everything you need for your application built-in. If you are building a Plugin
for Gasket, or have special requirements to customize your server with
additional routes and middleware, this guide is for you!

Before you go on, make sure you understand [how to author plugins][plugins].
Whether your custom Express middleware is for a plugin to be shared across
multiple apps, or for a standalone plugin used solely by your app, the plugin
system is necessary to do any Express app customization.

## Express lifecycle

Plugins hook the `express` lifecycle to add middleware and routes directly to
the Express app instance:

```js
// Sample plugin
export default {
  name: 'sample-plugin',
  hooks: {
    express(gasket, app) {
      app.param('id', require('./form-id-handler'));
      app.post('/submit/:id', require('./handle-form-submits'));
    }
  }
};
```

## ErrorMiddleware lifecycle

Finally, plugins can hook the `errorMiddleware` lifecycle and return additional
middleware(s), typically for [error handling].

```js
import errorLoggingClient from 'some-error-logger';

// Sample plugin
export default {
  name: 'sample-plugin'
  hooks: {
    errorMiddleware(gasket) {
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

<!-- LINKS -->

[error handling]:http://expressjs.com/en/guide/error-handling.html
[plugins]:/packages/gasket-cli/docs/plugins.md
