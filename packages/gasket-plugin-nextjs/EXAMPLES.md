# @gasket/plugin-nextjs Examples

This document provides practical examples for all exported functions, lifecycle hooks, and utilities from the `@gasket/plugin-nextjs` package.

## Plugin Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginNextjs from '@gasket/plugin-nextjs';

export default makeGasket({
  plugins: [
    pluginNextjs
  ],
  nextConfig: {
    poweredByHeader: false,
    trailingSlash: true
  }
});
```

### Custom Next.js Configuration

```js
// next.config.js
import gasket from './gasket.js';

export default gasket.actions.getNextConfig();
```

## Gasket Actions

### getNextConfig

Get the complete Next.js configuration object with all plugin modifications applied.

```js
// Basic usage in next.config.js
import gasket from './gasket.js';

export default gasket.actions.getNextConfig();
```

### getNextRoute

Get route information for a specific request in server middleware.

```js
// In Express lifecycle
export default {
  name: 'route-analytics-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const route = await gasket.actions.getNextRoute(req);

        if (route) {
          console.log('Page:', route.page);
          console.log('Route keys:', route.routeKeys);

          // For dynamic routes like /posts/[id]
          const match = req.url.match(route.namedRegex);
          if (match && match.groups) {
            console.log('Route params:', match.groups);
          }
        }

        next();
      });
    }
  }
};
```

## Lifecycle Hooks

### nextConfig

Modify Next.js configuration before the server is created.

```js
export default {
  name: 'webpack-config-plugin',
  hooks: {
    nextConfig(gasket, config) {
      return {
        ...config,
        webpack: (webpackConfig, { isServer }) => {
          if (!isServer) {
            webpackConfig.resolve.fallback = {
              fs: false,
              net: false,
              tls: false
            };
          }
          return webpackConfig;
        }
      };
    }
  }
};
```

### next

Access the Next.js server instance after creation.

```js
export default {
  name: 'cdn-plugin',
  hooks: {
    next(gasket, nextServer) {
      if (gasket.config.env === 'production') {
        nextServer.setAssetPrefix('https://cdn.example.com');
    nextConfig(gasket, config) {
      return {
        ...config,
        assetPrefix: gasket.config.env === 'production'
          ? 'https://cdn.example.com'
          : config.assetPrefix
      };
    }
  }
};
```

### nextExpress

Handle Express-specific Next.js integration.

```js
export default {
  name: 'api-routes-plugin',
  hooks: {
    nextExpress(gasket, { next, express }) {
      // Add custom API routes
      express.post('/api/webhook', (req, res) => {
        // Process webhook
        res.json({ received: true });
      });

      // Render Next.js pages programmatically
      express.get('/custom-page/:id', (req, res) => {
        return next.render(req, res, '/dynamic-page', {
          id: req.params.id
        });
      });
    }
  }
};
```

### nextFastify

Handle Fastify-specific Next.js integration.

```js
export default {
  name: 'fastify-api-plugin',
  hooks: {
    nextFastify(gasket, { next, fastify }) {
      // Add Fastify routes
      fastify.post('/api/data', async (request, reply) => {
        return { data: 'processed' };
      });

      // Render Next.js pages
      fastify.get('/special/:id', async (request, reply) => {
        await next.render(request.raw, reply.raw, '/special-page', {
          id: request.params.id
        });
      });
    }
  }
};
```

### nextPreHandling

Execute logic before Next.js processes requests.

```js
export default {
  name: 'auth-plugin',
  hooks: {
    async nextPreHandling(gasket, { req, res, nextServer }) {
      // Add authentication check
      if (req.url.startsWith('/admin') && !req.headers.authorization) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      // Add custom headers
      res.setHeader('X-Custom-Header', 'gasket-app');
    }
  }
};
```

## Development Environment

### Using GASKET_DEV

```bash
# Start development server when using Custom Server
GASKET_DEV=1 npm run local
```

```js
// In server.js for custom server
import gasket from './gasket.js';

// Check if in development mode
const isDev = process.env.GASKET_DEV;

gasket.actions.startServer();
```
