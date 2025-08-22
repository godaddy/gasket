# @gasket/plugin-workbox Examples

This document provides working examples for using `@gasket/plugin-workbox`.

## Plugin Installation and Basic Setup

### Basic Plugin Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginWorkbox from '@gasket/plugin-workbox';

export default makeGasket({
  plugins: [
    pluginWorkbox
  ]
});
```

### Plugin with Basic Workbox Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginWorkbox from '@gasket/plugin-workbox';

export default makeGasket({
  plugins: [
    pluginWorkbox
  ],
  workbox: {
    config: {
      skipWaiting: true,
      clientsClaim: true
    }
  }
});
```

## Configuration Examples

### Custom Output Directory

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginWorkbox
  ],
  workbox: {
    outputDir: './public/sw-assets',
    config: {
      skipWaiting: true
    }
  }
});
```

### CDN Configuration with Base Path

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginWorkbox
  ],
  workbox: {
    basePath: 'https://cdn.example.com',
    config: {
      skipWaiting: true
    }
  }
});
```

### Runtime Caching Strategies

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginWorkbox
  ],
  workbox: {
    config: {
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.example\.com/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        }
      ]
    }
  }
});
```

## Using the `workbox` Lifecycle Hook

### Basic Workbox Hook Implementation

```js
// my-plugin.js
export default {
  name: 'my-caching-plugin',
  hooks: {
    workbox(gasket, workboxConfig, context) {
      return {
        runtimeCaching: [
          {
            urlPattern: /\/api\/data/,
            handler: 'NetworkFirst'
          }
        ]
      };
    }
  }
};
```

### Request-Based Configuration

```js
// request-aware-plugin.js
export default {
  name: 'request-aware-caching',
  hooks: {
    workbox(gasket, workboxConfig, context) {
      const { req } = context;

      if (req) {
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android/i.test(userAgent);

        return {
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg)$/,
              handler: isMobile ? 'NetworkFirst' : 'CacheFirst',
              options: {
                cacheName: isMobile ? 'mobile-images' : 'desktop-images'
              }
            }
          ]
        };
      }

      return {};
    }
  }
};
```
