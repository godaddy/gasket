# Gasket Progressive Web Apps

[Progressive Web Apps][PWA] (PWA) is the latest buzzword for web app development
these days it seems. There are several real [advantages][PWA Advantages] which
warrant enabling PWA features via Gasket for our apps.

**Table of Contents:**
 - [Overview]
 - [Service Worker]
 - [Caching]
 - [Manifest]
 - [Setup]

## Overview

Several elements make a progressive web app as seen from the
[PWA Checklist]. At a high level, we will need to be able to:
- Register a [Service Worker]
- [Precache][Caching] files
- Set a [Manifest]

Gasket provides plugins to make enabling these features a breeze.
These include:
- [@gasket/service-worker-plugin]
- [@gasket/workbox-plugin]
- [@gasket/manifest-plugin]

Utilizing these will allow apps to:

- Load much faster, especially for repeat sessions.
- Prompt to install or add Home Screen.
  - More integrated experience for customers.
  - Web app behaves and feels native.
- Work offline
  - Allows users to continue work when reception is spotty. Opens the door
    for background sync.
- Support push notifications

Let's now look into how to use these plugins.

## Service Worker

[Service workers] (SW) are scripts that run separate from the main web page and
enable progressive web app features such as precaching, push notifications, and
background syncing.

### @gasket/service-worker-plugin

With this plugin enabled, your app will automatically be serving a service 
worker! By default, it will be served at `/sw.js`, but this is adjustable via
config options. The defaults options for this plugin should be sufficient.
However, they are tunable as needed for your app under `serviceWorker` in
the `gasket.config.js` file. Be sure to see the
[service worker plugin docs] for more details on setup and config.

The service worker script is composed using the `composeServiceWorker`
lifecycle which plugins and apps can hook into, and add to the script by
concatenating inline script text or content from a loaded file.

Once such plugin that composes service worker scripts, and that handles much
of what you would commonly want for a PWA, is the Workbox plugin.

## Caching

With precaching, an app's pages, chunks, and assets are downloaded and stored
on the device, _before_ they are actually needed. This happens asynchronously
and results in a faster experience. Additionally, other files can be cached
with on-demand runtime strategies, such as cacheFirst, or networkFirst.
In additional to speed, precaching unlocks the ability for our apps to have
offline support for avaliability.

### @gasket/workbox-plugin

This plugin provides precaching as well as runtime caching, by implementing
service worker configuration using [Workbox].
_Workbox is a library that bakes in a set of best practices and removes the
boilerplate every developer writes when working with service workers._
With this plugin enabled, your app will begin serving the workbox libraries and
compose the service worker script for it. You can add custom workbox config to
under `workbox.config` in the `gasket.config.js` file. Be sure to see the
[workbox plugin docs] for more details on setup and config.

When a request is made to your for the service worker script, this plugin will
execute a `workbox` lifecycle which plugins and the app can hook into which
allows them to add to the workbox config. The workbox-plugin with then take
that config, and use it to generate the service worker script.

For example, when using `@gasket/nextjs-plugin`, the next build files and 
static assets will be added to the workbox config and automatically ready for
precaching.

## Manifest

_The web app manifest is a simple JSON file that tells the browser about your
web application and how it should behave when 'installed' on the user's mobile
device or desktop._ This allows your application to take full advantage of
being a [Progressive Web App][PWA].

### @gasket/manifest-plugin

This plugin adds support for a custom `manifest.json` to be provided for your
app. To configure what is in the manifest, you can set this under `manifest` in
the `gasket.config.js`. Be sure to see the
[manifest plugin docs] for more details on setup and config.

In addition to static manifest config as mentioned, a `manifest` lifecycle is
available for plugins and apps to hook, to adjust the manifest on a per-request
basis.

## Setup

This is an example `gasket.config.js` with the minimal require setup to
configure your app to be a Progressive Web App!

```js
// gasket.config.js
module.exports = {
  plugins: {
    presets: ['nextjs'],
    add: ['service-worker', 'workbox', 'manifest']
  },
  manifest: {
    name: 'My Full App Name',
    short_name: 'App Name',
    icons: [
      {
        type: 'image/png',
        src: '/static/icons/my-icon-192.png',
        sizes: '192x192'
      },
      {
        type: 'image/png',
        src: '/static/icons/my-icon-512.png',
        sizes: '512x512'
      }
    ]
  },
}
```

From here, you can add additional Workbox caching rules for apis or services
your app utilizes, and add support for push notifications or any other service
worker features.

[Overview]:#overview
[Service Worker]:#service-worker
[Caching]:#caching
[Manifest]:#manifest
[Setup]:#setup
[@gasket/service-worker-plugin]:#gasketservice-worker-plugin
[@gasket/workbox-plugin]:#gasketworkbox-plugin
[@gasket/manifest-plugin]:#gasketmanifest-plugin

[service worker plugin docs]:/packages/gasket-service-worker-plugin#gasketservice-worker-plugin
[workbox plugin docs]:/packages/gasket-workbox-plugin#gasketworkbox-plugin
[manifest plugin docs]:/packages/gasket-manifest-plugin#gasketmanifest-plugin

[Service Workers]:https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
[PWA]:https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive
[PWA Advantages]:https://developer.mozilla.org/en-US/docs/Web/Apps/Progressive/Advantages
[PWA Checklist]:https://developers.google.com/web/progressive-web-apps/checklist/
[PWA Manifest]:https://developers.google.com/web/fundamentals/web-app-manifest/
[Workbox]:https://github.com/GoogleChrome/workbox
