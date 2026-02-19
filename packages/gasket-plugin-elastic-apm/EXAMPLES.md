# Examples

This document provides working examples for all exported functions and lifecycle hooks from `@gasket/plugin-elastic-apm`.

## Plugin Configuration

### Basic Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginElasticApm from '@gasket/plugin-elastic-apm';

export default makeGasket({
  plugins: [
    pluginElasticApm
  ],
  elasticAPM: {
    sensitiveCookies: ['sessionId', 'authToken']
  }
});
```

### Environment Variable Configuration

```js
// setup.js
import 'dotenv/config';
import apm from 'elastic-apm-node';

apm.start({
  serviceName: 'my-service',
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
});
```

## Actions

### getApmTransaction

Access and decorate the current APM transaction:

```js
// In the express lifecycle
export default {
  name: 'my-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const transaction = await gasket.actions.getApmTransaction(req);

        if (transaction) {
          transaction.setLabel('userId', req.user?.id);
          transaction.setLabel('requestId', req.headers['x-request-id']);
        }

        next();
      });
    }
  }
};
```

```js
// In Next.js API route
// pages/api/users.js
import gasket from '../../gasket.js';

export default async function handler(req, res) {
  const transaction = await gasket.actions.getApmTransaction(req);

  if (transaction) {
    transaction.setLabel('endpoint', '/api/users');
  }

  // Your API logic here
  res.json({ users: [] });
}
```

## Lifecycle Hooks

### apmTransaction

Customize APM transaction with additional context:

```js
// In a plugin
export default {
  name: 'apm-customization-plugin',
  hooks: {
    apmTransaction(gasket, transaction, { req }) {
      // Add custom labels
      transaction.setLabel('userAgent', req.headers['user-agent']);
      transaction.setLabel('locale', req.headers['accept-language']);

      // Set custom name based on route
      if (req.route?.path) {
        transaction.name = `${req.method} ${req.route.path}`;
      }

      // Add user context
      if (req.user) {
        transaction.setUser({
          id: req.user.id,
          email: req.user.email
        });
      }
    }
  }
};
```

```js
// Conditional APM decoration
export default {
  name: 'conditional-apm-plugin',
  hooks: {
    apmTransaction(gasket, transaction, { req }) {
      // Only add expensive labels for non-health check requests
      if (!req.path.startsWith('/health')) {
        transaction.setLabel('expensive-operation', true);

        // Add custom data based on request
        if (req.path.startsWith('/api/')) {
          transaction.setLabel('api-version', req.headers['api-version'] || 'v1');
        }
      }
    }
  }
};
```
