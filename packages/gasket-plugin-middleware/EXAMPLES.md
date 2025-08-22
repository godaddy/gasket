# Examples

## Plugin Usage

### Basic Plugin Setup
```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginMiddleware from '@gasket/plugin-middleware';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
    pluginExpress,
    pluginMiddleware
  ]
});
```

### Middleware Configuration
```js
// gasket.js
export default makeGasket({
  plugins: [pluginExpress, pluginMiddleware],
  middleware: [
    {
      plugin: 'auth-plugin',
      paths: ['/api', '/protected']
    },
    {
      plugin: 'cors-plugin',
      paths: [/\/api\/v\d+/]
    }
  ],
  express: {
    middlewareInclusionRegex: /^(?!\/_next\/)/,
    compression: true,
    trustProxy: true
  }
});
```

## Creating Middleware with the Lifecycle Hook

### Simple Middleware
```js
// my-plugin.js
export default {
  name: 'my-plugin',
  hooks: {
    middleware(gasket, app) {
      return (req, res, next) => {
        console.log('Hello World');
        next();
      };
    }
  }
};
```

### Multiple Middleware
```js
// auth-plugin.js
export default {
  name: 'auth-plugin',
  hooks: {
    middleware(gasket, app) {
      return [
        (req, res, next) => {
          // Authentication middleware
          req.isAuthenticated = checkAuth(req);
          next();
        },
        (req, res, next) => {
          // Authorization middleware
          if (!req.isAuthenticated) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          next();
        }
      ];
    }
  }
};
```

### Middleware with Paths
```js
// api-plugin.js
export default {
  name: 'api-plugin',
  hooks: {
    middleware(gasket, app) {
      return {
        handler: (req, res, next) => {
          res.setHeader('Content-Type', 'application/json');
          next();
        },
        paths: ['/api', '/graphql']
      };
    }
  }
};
```

### Async Middleware
```js
// database-plugin.js
export default {
  name: 'database-plugin',
  hooks: {
    async middleware(gasket, app) {
      const dbConnection = await initializeDatabase();

      return (req, res, next) => {
        req.db = dbConnection;
        next();
      };
    }
  }
};
```
