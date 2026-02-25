# @gasket/plugin-express Examples

This document provides working examples for all exported interfaces in the `@gasket/plugin-express` package.

## Plugin Configuration

### Basic Plugin Usage

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
    pluginExpress
  ]
});
```

## Lifecycle Hooks

### express

Basic route definition:

```js
// plugins/routes-plugin.js
export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'OK' });
      });
    }
  }
};
```

Multiple routes and middleware:

```js
// plugins/api-plugin.js
export default {
  name: 'api-plugin',
  hooks: {
    express(gasket, app) {
      // Add route-specific middleware
      app.use('/api', (req, res, next) => {
        req.timestamp = Date.now();
        next();
      });

      // Define multiple routes
      app.get('/api/users', (req, res) => {
        res.json({ users: [] });
      });

      app.post('/api/users', (req, res) => {
        res.status(201).json({ message: 'User created' });
      });

      app.get('/api/users/:id', (req, res) => {
        res.json({ id: req.params.id, timestamp: req.timestamp });
      });
    }
  }
};
```

### errorMiddleware

Basic error handling:

```js
// plugins/error-handler-plugin.js
export default {
  name: 'error-handler-plugin',
  hooks: {
    errorMiddleware(gasket) {
      return (err, req, res, next) => {
        gasket.logger.error('Express error:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: err.message
        });
      };
    }
  }
};
```

Multiple error middleware:

```js
// plugins/multiple-error-handlers-plugin.js
export default {
  name: 'multiple-error-handlers-plugin',
  hooks: {
    errorMiddleware(gasket) {
      return [
        // Log errors
        (err, req, res, next) => {
          gasket.logger.error('Error occurred:', {
            error: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method
          });
          next(err);
        },
        // Handle specific error types
        (err, req, res, next) => {
          if (err.name === 'ValidationError') {
            return res.status(400).json({
              error: 'Validation Error',
              details: err.details
            });
          }
          next(err);
        },
        // Final error handler
        (err, req, res, next) => {
          res.status(err.status || 500).json({
            error: process.env.NODE_ENV === 'production'
              ? 'Internal Server Error'
              : err.message
          });
        }
      ];
    }
  }
};
```
