# @gasket/plugin-winston Examples

This document provides working examples for using `@gasket/plugin-winston`.

## Plugin Installation and Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
    pluginWinston
  ]
});
```

### Configuration Options

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import { transports, format } from 'winston';
import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
    pluginWinston
  ],
  winston: {
    level: 'debug',
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: 'app.log',
        level: 'info'
      })
    ]
  }
});
```

## Lifecycle Hooks

### winstonTransports Hook

Add custom transports through a plugin:

```js
// my-logging-plugin.js
import { transports } from 'winston';

export default {
  name: 'my-logging-plugin',
  hooks: {
    winstonTransports(gasket) {
      return new transports.File({
        filename: 'custom.log',
        level: 'info'
      });
    }
  }
};
```

## Using the Logger

### Basic Logger Usage

```js
// app.js
import gasket from './gasket.js';

const logger = gasket.logger;

logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred');
logger.debug('Debug information');
```

### Custom Log Levels

```js
// gasket.js with custom levels
import { makeGasket } from '@gasket/core';
import pluginWinston from '@gasket/plugin-winston';
import winston from 'winston';

// Define custom colors for levels
winston.addColors({
  fatal: 'red',
  critical: 'magenta',
  warn: 'yellow',
  trace: 'cyan'
});

export default makeGasket({
  plugins: [
    pluginWinston
  ],
  winston: {
    levels: {
      fatal: 0,
      error: 1,
      critical: 2,
      warn: 3,
      info: 4,
      debug: 5,
      trace: 6
    }
  }
});
```

```js
// Using custom levels
const logger = gasket.logger;

logger.fatal('Fatal error occurred');
logger.critical('Critical issue');
logger.trace('Trace level debug');
```

### Structured Logging

```js
// structured-logging.js
const logger = gasket.logger;

// Log with metadata
logger.info('User login', {
  userId: '12345',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Log with error object
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'user-registration'
  });
}
```
