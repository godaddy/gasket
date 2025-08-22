# @gasket/plugin-fastify Examples

This document provides working examples for all exported interfaces from `@gasket/plugin-fastify`.

## Plugin Installation and Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginFastify from '@gasket/plugin-fastify';

export default makeGasket({
  plugins: [
    pluginFastify
  ]
});
```

### Plugin Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginFastify
  ],
  fastify: {
    compression: true,
    trustProxy: true,
    disableRequestLogging: false
  }
});
```

## Lifecycle Hooks

### `fastify` Lifecycle Hook

Access and modify the Fastify instance:

```js
// Example plugin or lifecycle file
export default {
  name: 'my-fastify-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      // Register plugins
      app.register(require('@fastify/cors'), {
        origin: true
      });

      // Add hooks
      app.addHook('preHandler', async (request, reply) => {
        console.log('Processing request:', request.url);
      });

      // Add custom decorators
      app.decorate('customMethod', function() {
        return 'custom value';
      });

      // Add routes
      app.get('/hello', async (request, reply) => {
        return { hello: 'world' };
      });
    }
  }
};
```

### `errorMiddleware` Lifecycle Hook

Add Express-style error handling middleware:

```js
// Example plugin
export default {
  name: 'my-error-handler',
  hooks: {
    errorMiddleware: function (gasket) {
      return (error, req, res, next) => {
        gasket.logger.error('Request error:', error);

        // Handle different error types
        if (error.statusCode) {
          res.status(error.statusCode);
        } else {
          res.status(500);
        }

        res.send({
          error: 'Internal Server Error',
          message: error.message
        });
      };
    }
  }
};
```

## Configuration Examples

### Route Plugin Example

```js
// plugins/routes-plugin.js
export default {
  name: 'routes-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      // API routes
      app.get('/api/health', async (request, reply) => {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version
        };
      });

      app.get('/api/config', async (request, reply) => {
        return {
          environment: gasket.config.env,
          features: gasket.config.features || {}
        };
      });

      // Protected route example
      app.get('/api/protected', {
        preHandler: async (request, reply) => {
          const auth = request.headers.authorization;
          if (!auth || !auth.startsWith('Bearer ')) {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
          }
        }
      }, async (request, reply) => {
        return { message: 'Protected data' };
      });
    }
  }
};
```
