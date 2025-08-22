# @gasket/plugin-https Examples

This document provides working examples for all exported interfaces from `@gasket/plugin-https`.

## Plugin

### Basic Plugin Installation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginHttps from '@gasket/plugin-https';

export default makeGasket({
  plugins: [
    pluginHttps
  ]
});
```

### Plugin with Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginHttps from '@gasket/plugin-https';

export default makeGasket({
  plugins: [
    pluginHttps
  ],
  hostname: 'example.com',
  http: 8080,
  https: {
    port: 8443,
    root: '/path/to/ssl/files',
    key: 'server.key',
    cert: 'server.crt'
  }
});
```

## Actions

### startServer

Start the HTTP/HTTPS server with your Gasket app.

```js
// server.js
import gasket from './gasket.js';

// Start the server
gasket.actions.startServer();
```

```js
// server.js with async/await
import gasket from './gasket.js';

async function startApp() {
  try {
    await gasket.actions.startServer();
    console.log('Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startApp();
```

## Lifecycles

### preboot

Execute operations before the server starts.

```js
// gasket-plugin-preboot-example.js
export default {
  name: 'preboot-example',
  hooks: {
    async preboot(gasket) {
      // Initialize database connections
      await initializeDatabase();

      // Load configuration
      const config = await loadExternalConfig();
      gasket.logger.info('Preboot operations completed');
    }
  }
};

async function initializeDatabase() {
  // Database initialization logic
}

async function loadExternalConfig() {
  // Configuration loading logic
}
```

### devProxy

Configure proxy server for local development.

```js
// gasket-plugin-dev-proxy-example.js
export default {
  name: 'dev-proxy-example',
  hooks: {
    async devProxy(gasket, devProxyConfig) {
      return {
        ...devProxyConfig,
        hostname: 'localhost',
        port: 8443,
        protocol: 'https',
        target: {
          host: 'localhost',
          port: 3000
        },
        secure: false,
        changeOrigin: true
      };
    }
  }
};
```

### serverConfig

Modify server configuration before server creation.

```js
// gasket-plugin-server-config-example.js
export default {
  name: 'server-config-example',
  hooks: {
    async serverConfig(gasket, rawConfig) {
      // Add SNI configuration for multiple domains
      if (rawConfig.https) {
        rawConfig.https.sni = {
          'api.example.com': {
            key: '/path/to/api-key.pem',
            cert: '/path/to/api-cert.pem'
          },
          'admin.example.com': {
            key: '/path/to/admin-key.pem',
            cert: '/path/to/admin-cert.pem'
          }
        };
      }

      // Add custom server options
      return {
        ...rawConfig,
        timeout: 30000,
        keepAliveTimeout: 5000
      };
    }
  }
};
```

### createServers

Configure the server instances and handlers.

```js
// gasket-plugin-create-servers-example.js
import express from 'express';

export default {
  name: 'create-servers-example',
  hooks: {
    async createServers(gasket, serverOpts) {
      const app = express();

      // Add middleware
      app.use(express.json());
      app.use(express.static('public'));

      // Add routes
      app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
      });

      return {
        ...serverOpts,
        handler: app
      };
    }
  }
};
```

### terminus

Configure graceful shutdown behavior.

```js
// gasket-plugin-terminus-example.js
export default {
  name: 'terminus-example',
  hooks: {
    async terminus(gasket, terminusOpts) {
      return {
        ...terminusOpts,
        healthcheck: ['/health', '/status'],
        timeout: 10000,
        signals: ['SIGTERM', 'SIGINT'],
        useExit0: true,
        sendFailuresDuringShutdown: false
      };
    }
  }
};
```

### servers

Access server instances after creation.

```js
// gasket-plugin-servers-example.js
export default {
  name: 'servers-example',
  hooks: {
    async servers(gasket, servers) {
      const { http, https, http2 } = servers;

      if (http) {
        gasket.logger.info(`HTTP server listening on port ${http.address().port}`);
      }

      if (https) {
        gasket.logger.info(`HTTPS server listening on port ${https.address().port}`);

        // Access SSL certificate info
        const cert = https.cert;
        if (cert) {
          gasket.logger.info('SSL certificate loaded successfully');
        }
      }

      if (http2) {
        gasket.logger.info(`HTTP/2 server listening on port ${http2.address().port}`);
      }
    }
  }
};
```

### healthcheck

Implement health check logic.

```js
// gasket-plugin-healthcheck-example.js
export default {
  name: 'healthcheck-example',
  hooks: {
    async healthcheck(gasket, HealthCheckError) {
      try {
        // Check database connection
        await checkDatabase();

        // Check external services
        await checkExternalServices();

        // Check memory usage
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > MEMORY_USAGE_THRESHOLD_BYTES) {
          throw new HealthCheckError('High memory usage detected');
        }

        gasket.logger.info('Health check passed');
      } catch (error) {
        gasket.logger.error('Health check failed:', error);
        throw new HealthCheckError(`Health check failed: ${error.message}`);
      }
    }
  }
};

async function checkDatabase() {
  // Database health check logic
}

async function checkExternalServices() {
  // External service health check logic
}
```

### onSendFailureDuringShutdown

Handle health check failures during shutdown.

```js
// gasket-plugin-shutdown-failure-example.js
export default {
  name: 'shutdown-failure-example',
  hooks: {
    async onSendFailureDuringShutdown(gasket) {
      gasket.logger.warn('Health check failed during shutdown - this is expected');

      // Optional: Send alert to monitoring system
      await sendShutdownAlert('Health check failed during graceful shutdown');
    }
  }
};

async function sendShutdownAlert(message) {
  // Send alert to monitoring system
}
```

### beforeShutdown

Execute cleanup before server shutdown.

```js
// gasket-plugin-before-shutdown-example.js
export default {
  name: 'before-shutdown-example',
  hooks: {
    async beforeShutdown(gasket) {
      gasket.logger.info('Starting graceful shutdown process');

      // Stop accepting new connections
      await stopAcceptingConnections();

      // Finish processing current requests
      await finishCurrentRequests();

      gasket.logger.info('Ready for shutdown');
    }
  }
};

async function stopAcceptingConnections() {
  // Stop accepting new connections logic
}

async function finishCurrentRequests() {
  // Wait for current requests to finish
}
```

### onSignal

Clean up resources when shutdown signal is received.

```js
// gasket-plugin-on-signal-example.js
export default {
  name: 'on-signal-example',
  hooks: {
    async onSignal(gasket) {
      gasket.logger.info('Shutdown signal received, cleaning up resources');

      try {
        // Close database connections
        await closeDatabaseConnections();

        // Close Redis connections
        await closeRedisConnections();

        // Clean up temporary files
        await cleanupTempFiles();

        gasket.logger.info('Resource cleanup completed');
      } catch (error) {
        gasket.logger.error('Error during resource cleanup:', error);
      }
    }
  }
};

async function closeDatabaseConnections() {
  // Close database connections
}

async function closeRedisConnections() {
  // Close Redis connections
}

async function cleanupTempFiles() {
  // Clean up temporary files
}
```

### onShutdown

Final cleanup before process termination.

```js
// gasket-plugin-on-shutdown-example.js
export default {
  name: 'on-shutdown-example',
  hooks: {
    async onShutdown(gasket) {
      gasket.logger.info('Final shutdown step - process will terminate soon');

      // Log shutdown metrics
      const uptime = process.uptime();
      gasket.logger.info(`Server uptime: ${uptime} seconds`);

      // Send final metrics or logs
      await sendFinalMetrics({ uptime });

      gasket.logger.info('Goodbye!');
    }
  }
};

async function sendFinalMetrics(metrics) {
  // Send final metrics to monitoring system
}
```

## Configuration Examples

### HTTP Only

```js
// gasket.js
export default makeGasket({
  plugins: [pluginHttps],
  http: 8080
});
```

### HTTPS Only

```js
// gasket.js
export default makeGasket({
  plugins: [pluginHttps],
  https: {
    port: 8443,
    key: 'server.key',
    cert: 'server.crt'
  }
});
```

### HTTP/2 Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginHttps],
  http2: {
    port: 8443,
    key: 'server.key',
    cert: 'server.crt',
    allowHTTP1: true
  }
});
```

### Multiple Server Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginHttps],
  http: 8080,
  https: [
    {
      port: 8443,
      key: 'server.key',
      cert: 'server.crt'
    },
    {
      port: 9443,
      key: 'admin.key',
      cert: 'admin.crt'
    }
  ]
});
```

### Dev Proxy Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginHttps],
  devProxy: {
    hostname: 'localhost',
    port: 8443,
    protocol: 'https',
    target: {
      host: 'localhost',
      port: 3000
    },
    changeOrigin: true,
    secure: false
  }
});
```
