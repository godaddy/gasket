# @gasket/plugin-manifest Examples

This document provides working examples for all exported methods, functions, and types from `@gasket/plugin-manifest`.

## Plugin Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginManifest from '@gasket/plugin-manifest';

export default makeGasket({
  plugins: [
    pluginManifest
  ],
  manifest: {
    short_name: 'MyApp',
    name: 'My Progressive Web Application',
    description: 'A demo PWA built with Gasket',
    start_url: '/',
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  }
});
```

### Static Manifest Generation

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginManifest
  ],
  manifest: {
    short_name: 'StaticApp',
    name: 'Static PWA',
    staticOutput: 'public/manifest.json', // Generate static file
    icons: [
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
});
```

### Custom Manifest Path

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginManifest
  ],
  manifest: {
    path: '/custom/manifest.json', // Serve from custom path
    short_name: 'CustomApp',
    name: 'Custom Path PWA'
  }
});
```

## Manifest Lifecycle Hook

### Basic Manifest Hook

```js
// my-plugin.js
export default {
  name: 'my-manifest-plugin',
  hooks: {
    manifest: async function(gasket, manifest, { req, res }) {
      return {
        ...manifest,
        theme_color: '#ff6b35',
        start_url: '/?utm_source=homescreen'
      };
    }
  }
};
```

### Request-Based Manifest Customization

```js
// locale-manifest-plugin.js
export default {
  name: 'locale-manifest-plugin',
  hooks: {
    manifest: async function(gasket, manifest, { req }) {
      const locale = req.headers['accept-language'] || 'en';
      const isRTL = locale.startsWith('ar') || locale.startsWith('he');

      return {
        ...manifest,
        lang: locale.split(',')[0].split('-')[0],
        dir: isRTL ? 'rtl' : 'ltr',
        name: locale.startsWith('es') ? 'Mi Aplicación' : manifest.name
      };
    }
  }
};
```

### Environment-Based Manifest

```js
// env-manifest-plugin.js
export default {
  name: 'env-manifest-plugin',
  hooks: {
    manifest: async function(gasket, manifest, { req }) {
      const isDev = gasket.config.env === 'development';

      return {
        ...manifest,
        name: isDev ? `[DEV] ${manifest.name}` : manifest.name,
        theme_color: isDev ? '#ff0000' : manifest.theme_color,
        start_url: isDev ? '/?dev=true' : manifest.start_url
      };
    }
  }
};
```
