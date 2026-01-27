# Express Setup Guide

Normally, the Express server that is set up by Gasket plugins should have
everything you need for your application built-in. If you are building a Plugin
for Gasket, or have special requirements to customize your server with
additional routes and middleware, this guide is for you!

Before you go on, make sure you understand [how to author plugins][plugins].
Whether your custom Express middleware is for a plugin to be shared across
multiple apps, or for a standalone plugin used solely by your app, the plugin
system is necessary to do any Express app customization.

## Middleware lifecycle

After some standard middleware is injected, a plugin can hook the `middleware`
lifecycle and return a middleware or array of middlewares to be added. This hook
is passed the typical `gasket` object as with any hook, and the `express`
instance:

```js
import someMiddleware from 'some-middleware';
import anotherMiddleware from 'another-middleware';

// Sample plugin
export default {
  name: 'sample-plugin',
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

## Express lifecycle

The `express` lifecycle is next. This provides an opportunity to do things with
the app object directly, like attaching route handlers:

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

## Middleware paths

You can configure which paths middleware will run on by adding the middleware
configuration array to your `gasket.js`. The array is made up of
objects with the name of the middleware (Gasket plugin name) you want to
configure and an array of path patterns representing the paths to match for this
middleware. Pattern matching entries in the array can come in the form of path
strings, path pattern strings, and/or regular expressions. Pattern matching
logic follows Express's [app.use pattern matching].

```js
export default makeGasket({
  middleware: [
    {
      plugin:'gasket-plugin-example', // Name of the Gasket plugin
      paths: ['/api']
    },
    {
      plugin:'@some/gasket-plugin-example',
      paths: [/\/default/]
    },
    {
      plugin: '@another/gasket-plugin-example',
      paths: ['/proxy', /\/home/]
    }
  ]
});
```

<!-- LINKS -->

[error handling]:http://expressjs.com/en/guide/error-handling.html
[plugins]:/packages/gasket-cli/docs/plugins.md
[timing mechanism]:/packages/gasket-engine/README.md
[app.use pattern matching]: http://expressjs.com/en/4x/api.html#path-examples
