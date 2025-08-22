# @gasket/plugin-service-worker Examples

## Basic Plugin Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginServiceWorker from '@gasket/plugin-service-worker';

export default makeGasket({
  plugins: [
    pluginServiceWorker
  ],
  serviceWorker: {
    url: '/sw.js',
    scope: '/',
    content: '', // Optional initial content
    cacheKeys: [(req) => req.headers['accept-language'] || 'en-US'],
    cache: {
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
      updateAgeOnGet: true
    },
    minify: {
      compress: true,
      mangle: true
    },
    webpackRegister: true,
    staticOutput: false
  }
});
```

## getSWRegisterScript Action

### Next.js App Router

```js
// app/layout.js
import gasket from '../gasket.js';

export default async function RootLayout({ children }) {
  const swRegisterScript = await gasket.actions.getSWRegisterScript();

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <div dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </body>
    </html>
  );
}
```

### Express Route

```js
// server.js
import express from 'express';
import gasket from './gasket.js';

const app = express();

app.get('/', async (req, res) => {
  const swRegisterScript = await gasket.actions.getSWRegisterScript();

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <h1>Hello World</h1>
        ${swRegisterScript}
      </body>
    </html>
  `);
});
```

## composeServiceWorker Lifecycle Hook

### Adding Inline Service Worker Code

```js
// plugin-push-notifications.js
export default {
  name: 'plugin-push-notifications',
  hooks: {
    composeServiceWorker(gasket, content, { req, res }) {
      return content + `
        self.addEventListener('push', (event) => {
          const title = 'My App Notification';
          const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
          };
          event.waitUntil(
            self.registration.showNotification(title, options)
          );
        });
      `;
    }
  }
};
```

### Loading External Service Worker Files

```js
// plugin-market-specific-sw.js
import { readFile } from 'fs/promises';
import path from 'path';

export default {
  name: 'plugin-market-specific-sw',
  hooks: {
    async composeServiceWorker(gasket, content, { req, res }) {
      const market = req.cookies?.market || 'en-US';
      const swFile = path.join('sw-partials', `${market.toLowerCase()}.js`);

      try {
        const marketSpecificContent = await readFile(swFile, 'utf8');
        return content + marketSpecificContent;
      } catch (error) {
        gasket.logger.warn(`No SW partial found for market: ${market}`);
        return content;
      }
    }
  }
};
```

## serviceWorkerCacheKey Lifecycle Hook

### Basic Cache Key Based on Locale

```js
// plugin-locale-cache.js
export default {
  name: 'plugin-locale-cache',
  hooks: {
    serviceWorkerCacheKey(gasket) {
      return function localeCacheKey(req, res) {
        return req.headers['accept-language']?.split(',')[0] || 'en-US';
      };
    }
  }
};
```
