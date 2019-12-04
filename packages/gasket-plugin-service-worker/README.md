# @gasket/plugin-service-worker

[Service workers] (SW) are scripts that run separate from the main web page and
enable progressive web app features such as precaching, push notifications, and
background syncing.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-service-worker
```

#### Existing apps

```
npm i @gasket/plugin-service-worker
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: [
    add: [
+      '@gasket/plugin-service-worker'
    ]
  ]
}
```

## Configuration

### Options

To be set in under `serviceWorker` in the `gasket.config.js`.

- `url` - (string) Name the service worker file. Default is `/sw.js`
- `scope` - (string) From where to intercept requests. Default is `/`
- `content` - (string) The JavaScript content to be served. While this can be
  initialized in the Gasket config, the expectation is it will be modified by
  plugins using `composeServiceWorker` lifecycle.
- `cacheKeys` - (function[]) Optional cache key functions that accept the
  request object as argument and return a string.
- `cache` - (object) adjust the content cache settings using the
  [lru-cache options]. By default, content will remained cached for 5 days from
  last request.
- `minify` - (object). Minification options to be used on the composed
  JavaScript. Configuration for this field is passed directly to [`uglify-js`].
  This is turned on in `production` by default. Adding `minify: { }` will turn
  on the default behavior in other environments, if specified.

#### Example

The defaults options for this plugin should be sufficient. However, they can be
tuned as needed. A real-world use case may be for a micro-app served under a
sub-path.

For example, say there is a "docs" Gasket app, served from `/docs` under the
primary domain. For the service worker to be installed and properly scoped, the
following settings would be needed:

```js
// gasket.config.js

module.exports = {
  serviceWorker: {
    url: '/docs/server-worker.js',
    scope: '/docs',
    minify: {
      ie8: true
    }
  }
}
```

## Lifecycles

### composeServiceWorker

Allows plugins to add to the service worker script, by concatenating inline
script text or loaded file data.

#### Example inline script

This example adds a simple listener for push notifications to the service worker
content.

```js
module.exports = {
  hooks: {
    composeServiceWorker: function (gasket, content, req) {

      // `req` allows SW content based on hostname, cookie, etc.

      return content.concat(`
self.addEventListener('push', (event) => {
  const title = 'My App Notification';
  const options = {
    body: event.data.text()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
`)
    }
  }
}
```

#### Example loaded script

In this example, we use the market id from the request to read in a partial
service worker and add it to the content.

```js
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

module.exports = {
  hooks: {
    composeServiceWorker: async function (gasket, content, req) {

      const { market = 'en-US' } = req.cookies || {};
      const marketFile = `${market.toLowerCase()}.js`;

      const partial = await readFile( path.join('sw', marketFile), 'utf8');

      return content + partial;
    }
  }
}
```

### serviceWorkerCacheKey

Allows plugins to effect the cache key based on the request.

Composing service workers can potentially be process intensive, and it is
unnecessary to recompose the service worker for each unique request. This hook
gathers functions which accept Request as an argument and return a string value.

**Verbose example:**

This example returns a function that picks off a variable from cookies.

```js
module.exports = {
  hooks: {
    serviceWorkerCacheKey: function (gasket) {
      return function marketCacheKey(req) {
        return req.cookies.market || 'en-US'
      }
    }
  }
}
```

**Shorthand example:**

Same example, written differently.

```js
module.exports = {
  hooks: {
    serviceWorkerCacheKey: () => req => req.cookies.market || 'en-US'
  }
}
```

## Register

Besides any config or lifecycle hooks your app or plugins may implement, the
service worker itself will need to be registered for your app.

A registration script is generated automatically by the plugin, and made
available to requests as `req.swRegisterScript`. You can use this when rendering
the index.html for your app, or other server side rendering, ensuring the
earliest registration of the service worker.

## How it works

Because there should only be a single service worker registered per scope (or
page), this plugin provides a lifecycle hook for apps and plugins to append
their service worker code. This also allows content to be generated based on the
request, such as language or cookie settings.

When a service worker request comes in, the Request object is passed through the
registered cacheKey functions and a key string assembled. If the cache _does
not_ contain the assembled key, a new service worker is composed and placed in
cache. If the cache _does_ contain the key, the cached service worker content is
returns and compose skipped.

## How to test

As this plugin expects to compose a service worker scripts from multiple
sources, testing can be a bit tricky.

The most straight-forward approach is to author unit tests for service workers
partials. To do so, use the [loaded script] approach which will allow your tests
to import the script also. Next, you will need to mock the service worker
environment, which can be easily done using [service-worker-mock].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[lru-cache options]:https://github.com/isaacs/node-lru-cache#options
[`uglify-js`]: https://www.npmjs.com/package/uglify-js
[Loaded script]:#loaded-script-example
[service-worker-mock]:https://github.com/pinterest/service-workers/tree/master/packages/service-worker-mock#service-worker-mock
[service workers]:https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
