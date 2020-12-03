# @gasket/plugin-manifest

Adds support for a custom [`manifest.json`] to be provided for your application.
This allows your application to take full advantage of being a [Progressive Web
Application]. This is useful for progressive web applications, and works best
when paired with `@gasket/plugin-workbox` and `@gasket/plugin-service-worker`.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-manifest
```

#### Existing apps

```
npm i @gasket/plugin-manifest
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-manifest'
    ]
  }
}
```

## Configuration

By default, this plugin will serve `{}` as your `manifest.json`. Consumers of
this plugin have 2 options in augmenting this object. The first is through
`gasket.config.js`:

```js
// gasket.config.js
module.exports = {
  manifest: {
    short_name: 'PWAwesome',
    name: 'Progressive Web Application'
  }
}
```

If you want to serve `manifest.json` from a custom path, the plugin can be
configured as follows.

```js
// gasket.config.js
module.exports = {
  manifest: {
    // other options
    path: '/custom/path/manifest.json' // default: /manifest.json
  }
}
```

If you want to generate a `manifest.json` file at build time for use with a static page/application, the plugin can be configured with the `staticOutput` option:

```js
// gasket.config.js
module.exports = {
  manifest: {
    // other options
    staticOutput: '/custom/path/manifest.json'
  }
}
```
You will also need to include a link to your `manifest.json` file on your static html pages:

```html
<link src="/manifest.json" rel="manifest">
```

Users also have the option to pass in a boolean value of `true`, which will tell gasket to configure the output path to a default value of `/manifest.json`.

## Lifecycles

### manifest

Another option to adjust the manifest is through a lifecycle hook. This
lifecycle method is executed every time an incoming http request is made that
matches either `manifest.json` or the service worker script (which is `sw.js` by
default).

```js
// lifecyles/manifest.js

/**
 * Generate a manifest.json that will be deeply merged into the existing ones.
 * In this example, we check if the requesting IP address is valid using an
 * arbitrary function.
 *
 * @param  {Gasket} gasket The Gasket API
 * @param {Object} manifest Waterfall manifest to adjust
 * @param  {Request} req Incoming HTTP Request
 * @return {Promise<Object>} updated manifest
 */
module.exports = async function (gasket, manifest, { req }) {
  const whitelisted = await checkAgainstRemoteWhitelist(req.ip);
  return {
    ...manifest,
    orientation: gasket.config.orientation,
    theme_color: (req.secure && whitelisted) ? '#00ff00' : '#ff0000'
  };
}
```

It is important to note that conflicting objects from `gasket.config.js` and a
`manifest` hook will be resolved by using the data from the *hook*.

Once the `manifest.json` has been resolved, it is suggested that consumers of
this plugin take advantage of the `workbox` hook. For example: here we cache any
icons that the application might use at runtime:

```js
// lifecycles/workbox.js

/**
 * Returns a config partial which will be merged
 * @param {Gasket} gasket The gasket API
 * @param {Object} config workbox config
 * @param {Request} req incoming HTTP request
 * @returns {Object} config which will be deeply merged
 */
module.exports = function (gasket, config, req) {
  const { icons = [] } = req.manifest;

  return {
    runtimeCaching: icons.map(icon => ({
      urlPattern: icon.src,
      handler: 'staleWhileRevalidate'
    }))
  };
};
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[`manifest.json`]: https://developers.google.com/web/fundamentals/web-app-manifest/
[Progressive Web Application]: https://developers.google.com/web/progressive-web-apps/
