# Examples

Working examples for @gasket/plugin-logger methods, actions, and utilities.

## Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginLogger from '@gasket/plugin-logger';

export default makeGasket({
  plugins: [
    pluginLogger
  ]
});
```

## Actions

### getLogger

Get the logger instance that was set up during initialization.

```js
// Using the action
const logger = gasket.actions.getLogger();
logger.info('Application started');
logger.error('Something went wrong');
```

## Lifecycle Hooks

### createLogger

Hook to provide a custom logger implementation. Must be synchronous and return a logger object.

```js
// custom-logger-plugin.js
export default {
  name: 'custom-logger-plugin',
  hooks: {
    createLogger() {
      return {
        debug: (msg) => console.log(`[DEBUG] ${msg}`),
        info: (msg) => console.log(`[INFO] ${msg}`),
        warn: (msg) => console.log(`[WARN] ${msg}`),
        error: (msg) => console.log(`[ERROR] ${msg}`),
        child: (metadata) => ({
          debug: (msg) => console.log(`[DEBUG] ${msg}`, metadata),
          info: (msg) => console.log(`[INFO] ${msg}`, metadata),
          warn: (msg) => console.log(`[WARN] ${msg}`, metadata),
          error: (msg) => console.log(`[ERROR] ${msg}`, metadata),
          child: (meta) => this.child({ ...metadata, ...meta })
        })
      };
    }
  }
};
```

### Using the Logger

Once the logger is set up, it's available on the gasket instance:

```js
// In any lifecycle hook or action
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      // Use the logger
      gasket.logger.info('Setting up Express routes');

      app.get('/health', (req, res) => {
        gasket.logger.debug('Health check requested');
        res.json({ status: 'ok' });
      });

      // Create child logger with context
      const requestLogger = gasket.logger.child({
        component: 'express-setup'
      });
      requestLogger.info('Express configured successfully');
    }
  }
};
```

## Built-in Logger Methods

The default logger provides all standard logging methods and child logger creation:

```js
// Basic logging
gasket.logger.debug('Debug message');
gasket.logger.info('Info message');
gasket.logger.warn('Warning message');
gasket.logger.error('Error message');

// Create child logger with metadata
const childLogger = gasket.logger.child({
  component: 'auth',
  userId: '12345'
});

childLogger.info('User logged in');
// Output includes metadata automatically

// Chain child loggers for more specific context
const requestLogger = childLogger.child({
  requestId: 'req-abc123'
});

requestLogger.error('Request failed');
// Output includes both component, userId, and requestId metadata
```

### Logger with Close Functionality

```js
// persistent-logger-plugin.js
import fs from 'fs';

export default {
  name: 'persistent-logger-plugin',
  hooks: {
    createLogger() {
      const logStream = fs.createWriteStream('app.log', { flags: 'a' });

      return {
        debug: (msg) => logStream.write(`[DEBUG] ${new Date().toISOString()} ${msg}\n`),
        info: (msg) => logStream.write(`[INFO] ${new Date().toISOString()} ${msg}\n`),
        warn: (msg) => logStream.write(`[WARN] ${new Date().toISOString()} ${msg}\n`),
        error: (msg) => logStream.write(`[ERROR] ${new Date().toISOString()} ${msg}\n`),
        child: (metadata) => ({
          debug: (msg) => logStream.write(`[DEBUG] ${new Date().toISOString()} ${msg} ${JSON.stringify(metadata)}\n`),
          info: (msg) => logStream.write(`[INFO] ${new Date().toISOString()} ${msg} ${JSON.stringify(metadata)}\n`),
          warn: (msg) => logStream.write(`[WARN] ${new Date().toISOString()} ${msg} ${JSON.stringify(metadata)}\n`),
          error: (msg) => logStream.write(`[ERROR] ${new Date().toISOString()} ${msg} ${JSON.stringify(metadata)}\n`),
          child: (meta) => this.child({ ...metadata, ...meta })
        }),
        close: async () => {
          return new Promise((resolve) => {
            logStream.end(resolve);
          });
        }
      };
    }
  }
};
```
