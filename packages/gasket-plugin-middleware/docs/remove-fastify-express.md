# Removing @fastify/express from Gasket Applications

This guide helps you migrate away from `@fastify/express` in your Gasket application. The `@fastify/express` package provides Express middleware compatibility for Fastify, but is meant only as an intermediary step for migration from Express to Fastify. Express specific code should be migrated to Fastify over time.

## Why Remove @fastify/express?

1. **Reduced Security Surface**: There is a major vulnerability in versions of the plugin `<= 4.0.2`. 
2. **Better Performance**: Native Fastify hooks are optimized for Fastify's architecture.
3. **Cleaner Architecture**: Using framework-native patterns leads to more maintainable code.
4. **Simplified Dependencies**: Removes the Express compatibility layer and its transitive dependencies.


## Migration Guide for Fastify Users

### Step 1: Audit Your Middleware Usage

First, identify where you're using Express-style middleware. Check for:

1. **The `middleware` lifecycle hook** in your plugins:

```js
// This Express-style middleware requires @fastify/express
export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return (req, res, next) => {
        // Express-style middleware
        req.customData = 'value';
        next();
      };
    }
  }
};
```

2. **The `errorMiddleware` lifecycle hook**:

```js
// This also requires @fastify/express
export default {
  name: 'my-error-plugin',
  hooks: {
    errorMiddleware: function (gasket) {
      return (err, req, res, next) => {
        res.status(500).send({ error: err.message });
      };
    }
  }
};
```

### Step 2: Convert to Native Fastify Patterns

#### Converting Request Middleware

**Before (Express-style via `middleware` hook):**

```js
export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return (req, res, next) => {
        req.startTime = Date.now();
        req.customHeader = req.headers['x-custom'];
        next();
      };
    }
  }
};
```

**After (Native Fastify via `fastify` hook):**

```js
export default {
  name: 'my-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      app.addHook('preHandler', async (request, reply) => {
        request.startTime = Date.now();
        request.customHeader = request.headers['x-custom'];
      });
    }
  }
};
```

#### Converting Cookie Parsing

**Before (Express cookie-parser):**

```js
import cookieParser from 'cookie-parser';

export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return cookieParser();
    }
  }
};
```

**After (Native @fastify/cookie):**

```bash
npm install @fastify/cookie
```

```js
import cookie from '@fastify/cookie';

export default {
  name: 'my-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      await app.register(cookie, {
        secret: 'my-secret', // for signed cookies
        hook: 'onRequest'
      });
    }
  }
};
```

#### Converting Compression

**Before (Express compression):**

```js
import compression from 'compression';

export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return compression();
    }
  }
};
```

**After (Native @fastify/compress):**

```bash
npm install @fastify/compress
```

```js
import compress from '@fastify/compress';

export default {
  name: 'my-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      await app.register(compress, {
        global: true,
        encodings: ['gzip', 'deflate']
      });
    }
  }
};
```

#### Converting CORS Middleware

**Before (Express cors):**

```js
import cors from 'cors';

export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return cors({ origin: true });
    }
  }
};
```

**After (Native @fastify/cors):**

```bash
npm install @fastify/cors
```

```js
import cors from '@fastify/cors';

export default {
  name: 'my-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      await app.register(cors, {
        origin: true
      });
    }
  }
};
```

#### Converting Error Handling

**Before (Express-style `errorMiddleware` hook):**

```js
export default {
  name: 'my-error-plugin',
  hooks: {
    errorMiddleware: function (gasket) {
      return (err, req, res, next) => {
        gasket.logger.error('Request failed:', err);
        res.status(err.statusCode || 500).send({
          error: 'Internal Server Error',
          message: err.message
        });
      };
    }
  }
};
```

**After (Native Fastify error handler):**

```js
export default {
  name: 'my-error-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      app.setErrorHandler((error, request, reply) => {
        gasket.logger.error('Request failed:', error);
        reply
          .code(error.statusCode || 500)
          .send({
            error: 'Internal Server Error',
            message: error.message
          });
      });
    }
  }
};
```

#### Converting Route-Specific Middleware

**Before (Express-style path middleware):**

```js
export default {
  name: 'my-auth-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return {
        paths: ['/api'],
        handler: (req, res, next) => {
          if (!req.headers.authorization) {
            return res.status(401).send({ error: 'Unauthorized' });
          }
          next();
        }
      };
    }
  }
};
```

**After (Native Fastify route hooks):**

```js
export default {
  name: 'my-auth-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      // Option 1: Register a scoped plugin for /api routes
      app.register(async (instance) => {
        instance.addHook('preHandler', async (request, reply) => {
          if (!request.headers.authorization) {
            reply.code(401).send({ error: 'Unauthorized' });
          }
        });
      }, { prefix: '/api' });

      // Option 2: Use route-level preHandler
      app.get('/api/protected', {
        preHandler: async (request, reply) => {
          if (!request.headers.authorization) {
            reply.code(401).send({ error: 'Unauthorized' });
          }
        }
      }, async (request, reply) => {
        return { data: 'protected resource' };
      });
    }
  }
};
```

#### Converting res.locals Pattern

The `@gasket/plugin-middleware` adds `res.locals` support for Fastify via `@fastify/express`. Here's how to migrate:

**Before (using res.locals):**

```js
// In middleware
req.res.locals.user = await getUser(req);

// Later in route handler
const user = req.res.locals.user;
```

**After (using request decorators):**

```js
export default {
  name: 'my-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      // Decorate request with a place to store data
      app.decorateRequest('locals', null);

      app.addHook('preHandler', async (request, reply) => {
        request.locals = {};
        request.locals.user = await getUser(request);
      });
    }
  }
};

// In route handler
app.get('/profile', async (request, reply) => {
  const user = request.locals.user;
  return { user };
});
```

### Step 3: Remove Dependencies

Once you've migrated all middleware to native Fastify patterns:

1. **Remove `@gasket/plugin-middleware`** from your `gasket.js` (if you no longer need the `middleware` lifecycle):

```diff
// gasket.js
import pluginFastify from '@gasket/plugin-fastify';
- import pluginMiddleware from '@gasket/plugin-middleware';

export default makeGasket({
  plugins: [
    pluginFastify,
-   pluginMiddleware
  ]
});
```

2. **Uninstall the packages:**

```bash
npm uninstall @gasket/plugin-middleware @fastify/express
```

3. **Install native Fastify plugins** as needed:

```bash
npm install @fastify/cookie @fastify/compress @fastify/cors
```

### Fastify Hook Reference

| Express Middleware Timing | Fastify Hook | Description |
|---------------------------|--------------|-------------|
| Before route handlers | `preHandler` | Runs after parsing, before route handler |
| Early in request | `onRequest` | First hook, runs before parsing |
| After response sent | `onResponse` | Runs after response is sent |
| On errors | `setErrorHandler` | Global error handling |
| After parsing | `preValidation` | After body parsing, before validation |
| Before serialization | `preSerialization` | Before response serialization |

---

## Migration Guide for Express Users

The `@gasket/plugin-middleware` works natively with Express using standard Express middleware patterns.
Express users should upgrade the version of `@gasket/plugin-middleware` to `>=7.5.2`. This will make ensure that the  `@fastify/express` is only a `devDependecy` of the middleware plugin and only conditionally included for fastify applications. 

Continue using the `middleware` lifecycle hook as-is. No changes are needed:

```js
export default {
  name: 'my-plugin',
  hooks: {
    middleware: function (gasket, app) {
      return (req, res, next) => {
        // Standard Express middleware - no @fastify/express involved
        next();
      };
    }
  }
};
```

### If You Want to Migrate to Fastify (Without @fastify/express)

If you're migrating from Express to Fastify for performance benefits, follow these steps:

1. **Replace `@gasket/plugin-express` with `@gasket/plugin-fastify`:**

```bash
npm uninstall @gasket/plugin-express
npm install @gasket/plugin-fastify
```

2. **Update your gasket.js:**

```diff
// gasket.js
- import pluginExpress from '@gasket/plugin-express';
+ import pluginFastify from '@gasket/plugin-fastify';
- import pluginMiddleware from '@gasket/plugin-middleware';

export default makeGasket({
  plugins: [
-   pluginExpress,
-   pluginMiddleware
+   pluginFastify
  ],
- express: {
+ fastify: {
    compression: true,
    trustProxy: true
  }
});
```

3. **Convert your middleware hooks to fastify hooks** using the patterns described in the Fastify section above.

---

## Common Middleware Conversion Cheatsheet

| Express Middleware | Fastify Equivalent | Installation |
|--------------------|-------------------|--------------|
| `cookie-parser` | `@fastify/cookie` | `npm i @fastify/cookie` |
| `compression` | `@fastify/compress` | `npm i @fastify/compress` |
| `cors` | `@fastify/cors` | `npm i @fastify/cors` |
| `helmet` | `@fastify/helmet` | `npm i @fastify/helmet` |
| `express-session` | `@fastify/session` | `npm i @fastify/session` |
| `body-parser` | Built-in | (Fastify parses JSON/form by default) |
| `serve-static` | `@fastify/static` | `npm i @fastify/static` |
| `express-rate-limit` | `@fastify/rate-limit` | `npm i @fastify/rate-limit` |

---

## Troubleshooting

### Error: "errorMiddleware requires @fastify/express"

This error means you're still using the `errorMiddleware` lifecycle hook. Convert to Fastify's native error handler:

```js
// Use setErrorHandler instead of errorMiddleware
app.setErrorHandler((error, request, reply) => {
  // Handle error
});
```

### Error: "app.use is not a function"

This error occurs when code expects Express's `app.use()` method on a Fastify instance. Migrate to:
- `app.addHook()` for middleware
- `app.register()` for plugins
- `app.route()` or `app.get/post/etc.` for routes

### Plugins using res.locals

If third-party plugins depend on `res.locals`, you may need to:
1. Keep `@fastify/express` temporarily
2. Contact the plugin maintainer about Fastify-native support
3. Fork and update the plugin yourself

---

## Additional Resources

- [Fastify Hooks Documentation](https://fastify.dev/docs/latest/Reference/Hooks/)
- [Fastify Plugins Ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/)
- [Migrating from Express](https://fastify.dev/docs/latest/Guides/Migration-Guide-V4/)
