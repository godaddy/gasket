# Examples

This document provides working examples for using `@gasket/plugin-morgan`.

## Plugin Installation and Configuration

### Basic Usage

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginMorgan from '@gasket/plugin-morgan';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
    pluginExpress,
    pluginMorgan
  ]
});
```

### Configuration Options

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginExpress,
    pluginMorgan
  ],
  morgan: {
    format: 'combined',
    options: {
      skip: (req, res) => res.statusCode < 400,
      immediate: false
    }
  }
});
```

### Different Log Formats

```js
// Using predefined format
export default makeGasket({
  morgan: {
    format: 'dev'
  }
});

// Using custom format
export default makeGasket({
  morgan: {
    format: ':method :url :status :res[content-length] - :response-time ms'
  }
});

// Using tiny format (default)
export default makeGasket({
  morgan: {
    format: 'tiny'
  }
});
```

### Advanced Options

```js
// Skip logging for certain requests
export default makeGasket({
  morgan: {
    format: 'combined',
    options: {
      skip: (req, res) => {
        // Skip health check endpoints
        return req.url === '/health' || req.url === '/ping';
      }
    }
  }
});

// Custom token usage
export default makeGasket({
  morgan: {
    format: ':method :url :status :user-id',
    options: {
// To use a custom token like ":user-id", you need to define it in Morgan before using it in the format.
// For example, in your server setup file (e.g., server.js):
//
//   import morgan from 'morgan';
//   morgan.token('user-id', function getUserId(req) {
//     // Return the user id from the request, or '-' if not available
//     return req.user ? req.user.id : '-';
//   });
//
// See https://github.com/expressjs/morgan#creating-new-tokens for more details.
export default makeGasket({
  morgan: {
    format: ':method :url :status :user-id',
    options: {
      // This is just showing the format usage
    }
  }
});
```
