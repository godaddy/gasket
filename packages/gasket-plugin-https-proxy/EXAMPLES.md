# @gasket/plugin-https-proxy Examples

This document provides working examples for all exported interfaces from `@gasket/plugin-https-proxy`.

## Plugin Configuration

### Basic Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';

export default makeGasket({
  plugins: [
    pluginHttpsProxy
  ],
  httpsProxy: {
    protocol: 'https',
    hostname: 'localhost',
    port: 8443,
    target: {
      host: 'localhost',
      port: 3000
    }
  }
});
```

### Advanced Configuration with SNI

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import tls from 'tls';
import fs from 'fs';

export default makeGasket({
  plugins: [
    pluginHttpsProxy
  ],
  httpsProxy: {
    protocol: 'https',
    hostname: 'example.com',
    port: 443,
    target: {
      host: 'localhost',
      port: 3000
    },
    ssl: {
      SNICallback: (hostname, cb) => {
        const ctx = tls.createSecureContext({
          key: fs.readFileSync(`./certs/${hostname}.key`),
          cert: fs.readFileSync(`./certs/${hostname}.crt`)
        });
        cb(null, ctx);
      }
    },
    xfwd: true,
    ws: true
  }
});
```

## Actions

### startProxyServer

Start the HTTPS proxy server with configured settings:

```js
// server.js
import gasket from './gasket.js';

gasket.actions.startProxyServer();
```

## Lifecycle Hooks

### prebootHttpsProxy

Execute operations before the proxy server starts:

```js
// my-plugin.js
export default {
  name: 'my-proxy-plugin',
  hooks: {
    prebootHttpsProxy: async function(gasket) {
      // Load SSL certificates
      gasket.logger.info('Loading SSL certificates...');
      await loadCertificates();

      // Initialize connection pools
      gasket.logger.info('Initializing connection pools...');
      await initializeConnectionPools();

      // Set up health check endpoints
      gasket.logger.info('Setting up health checks...');
      await setupHealthChecks();
    }
  }
};

async function loadCertificates() {
  // Certificate loading logic
  return new Promise(resolve => setTimeout(resolve, 100));
}

async function initializeConnectionPools() {
  // Connection pool initialization
  return new Promise(resolve => setTimeout(resolve, 50));
}

async function setupHealthChecks() {
  // Health check setup
  return new Promise(resolve => setTimeout(resolve, 25));
}
```
