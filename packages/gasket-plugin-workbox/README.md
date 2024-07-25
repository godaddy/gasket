# @gasket/plugin-workbox

Provides precaching and runtimeCaching via [Workbox].

Precaching downloads an app's pages, chunks, and assets and stores this on the
device, _before_ they are actually needed. This happens asynchronously and
results in a faster experience. Additionally, other files and be cached with
on-demand strategies, such as cacheFirst, or networkFirst.

This plugin implements service worker configuration using [Workbox]. _Workbox is
a library that bakes in a set of best practices and removes the boilerplate
every developer writes when working with service workers._

## Installation

```
npm i @gasket/plugin-workbox
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginWorkbox from '@gasket/plugin-workbox';

export default makeGasket({
  plugins: [
+   pluginWorkbox
  ]
});
```

## Configuration

Set the Workbox options, in the `gasket.js` under `workbox`.

- `outputDir` - (string) The path to the directory in which the Workbox libraries should be copied (default: `./build/workbox`)
- `basePath` - (string) Change the default path to `/_workbox` endpoint by
  adding a path prefix here. (default: ''). Used for setting up CDN support for
  Workbox files.
- `config`: (object) Any initial [workbox config options][generateSWString]
  which will be merged with those from any `workbox` lifecycle hooks.

#### Example config

```js
// gasket.js
export default makeGasket({
  workbox: {
    config: {
      runtimeCaching: [{
        urlPattern: /.png$/,
        handler: 'cacheFirst'
      }]
    }
  }
});
```

## Lifecycles

### workbox

This hook allows other Gasket plugins to add to the Workbox config in order to
precache files, set runtime cache rules, etc. Hooks should return an object
partial which will be deeply merged.

```js
module.exports = {
  hooks: {
    workbox: function (gasket, config, context) {
      // `config` is the initial workbox config
      // `context` is the service-worker context.
      const { req, res } = context;
      if(req) {
        // adjust config for request-based service workers using headers, cookies, etc.
      }

      // return a config partial which will be merged
      return {
        runtimeCaching: [{
          urlPattern: /https:\/\/some.api.com/,
          handler: 'networkFirst'
        }]
      }
    }
  }
}
```

For advanced configurations, be sure to read the workbox config options for
[generateSWString].

## How it works

For a service worker request, a config object is constructed by the Workbox
lifecycle hook, it is to [generateSWString] from the [workbox-build] module.
This will generate a string with service worker code for workbox which is then
appended to the service worker content in the [composeServiceWorker] hook from
[@gasket/plugin-service-worker].

During the `build` hook, the Workbox libraries are copied to the build output
directory so that they can be served by the app. The service worker will then
import these scripts, with requests to the `/_workbox` static files served by
the app. These can be set up to edge cache by setting the `basePath` option.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[composeServiceWorker]:/packages/gasket-plugin-service-worker/README.md#composeserviceworker
[@gasket/plugin-service-worker]:/packages/gasket-plugin-service-worker/README.md
[Workbox]:https://github.com/GoogleChrome/workbox
[Workbox precaching]:https://developers.google.com/web/tools/workbox/modules/workbox-precaching
[background sync]:https://developers.google.com/web/updates/2015/12/background-sync
[workbox-build]:https://developers.google.com/web/tools/workbox/modules/workbox-build
[generateSWString]:https://developers.google.com/web/tools/workbox/modules/workbox-build#generateswstring_mode
