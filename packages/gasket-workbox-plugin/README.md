# @gasket/plugin-workbox

Provides precaching and runtimeCaching via [Workbox].

Precaching downloads an app's pages, chunks, and assets and stores this on the
device, _before_ they are actually needed. This happens asynchronously and
results in a faster experience. Additionally, other files and be cached with
on-demand strategies, such as cacheFirst, or networkFirst.

In additional to SPEED, precaching unlocks the ability for our apps to have
offline support for AVAILABILITY and is a requirement for Add to Home Screen.

This plugin implements service worker configuration using [Workbox].
_Workbox is a library that bakes in a set of best practices and removes the
boilerplate every developer writes when working with service workers._

## Options

Set the Workbox options, in the `gasket.config.js` under `workbox`.

- `outputDir` - (string) path of directory to copy Workbox libraries to
  (default: `./build/workbox`)
- `assetPrefix` - (string) change the default path to `/_workbox` endpoint by
  adding a path prefix here. (default: ''). Used for setting up CDN support
  for Workbox files. `next.assetPrefix` will be used be unless specified here.
- `config`: (object) Any initial [workbox config options][generateSWString]
  which will be merged with those from any `workbox` lifecycle hooks.

## Example

```js
// gasket.config
module.exports = {
  workbox: {
    config: {
      runtimeCaching: [{
        urlPattern: /.png$/,
        handler: 'cacheFirst'
      }]
    }
  }
}
```

## Lifecycles

#### workbox

This hook allows other gasket plugins to add to the Workbox config in order to
precache files, set runtime cache rules, etc. Hooks should return an object
partial which will be deeply merged.

```js
module.exports = {
  hooks: {
    workbox: function (gasket, config, req) {      
      // the initial `config`
      // `req` allows rules based on headers, cookies, etc.
      
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
the app. These can be set up to edge cache by setting the `assetPrefix` option.

<!-- LINKS -->

[composeServiceWorker]:/packages/gasket-service-worker-plugin/README.md#composeserviceworker
[@gasket/plugin-service-worker]:/packages/gasket-service-worker-plugin/README.md#readme
[Workbox]:https://github.com/GoogleChrome/workbox
[Workbox precaching]:https://developers.google.com/web/tools/workbox/modules/workbox-precaching
[background sync]:https://developers.google.com/web/updates/2015/12/background-sync
[workbox-build]:https://developers.google.com/web/tools/workbox/modules/workbox-build
[generateSWString]:https://developers.google.com/web/tools/workbox/modules/workbox-build#generateswstring_mode
