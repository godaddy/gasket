# Environment Configuration Recipes

This guide provides best practices for handling environment-specific configuration in Gasket applications.

## Problem: Using `process.env.GASKET_ENV` in Browser Code

❌ **Don't do this:**

```js
// Bad: This will fail the build
const apiUrl = process.env.GASKET_ENV === 'prod'
  ? 'https://api.example.com'
  : 'http://localhost:3000';
```

**Why this is problematic:**
- Exposes server-side environment configuration to browsers
- Can leak sensitive information about your infrastructure
- Makes your bundle depend on server-side build environment
- Breaks the separation between server and client configuration

## Solution 1: Environment-Specific Configuration with `gasket.config.env`

✅ **Recommended approach:**

### Define environment-specific configuration

```js
// gasket.js
export default makeGasket({
  // Base configuration
  apiUrl: 'http://localhost:3000',

  // Environment-specific overrides
  environments: {
    test: {
      apiUrl: 'https://test-api.example.com'
    },
    staging: {
      apiUrl: 'https://staging-api.example.com'
    },
    prod: {
      apiUrl: 'https://api.example.com'
    }
  }
});
```

### Access in server-side code

```js
// In a plugin or lifecycle
export default {
  name: 'api-plugin',
  hooks: {
    express(gasket, app) {
      const { apiUrl } = gasket.config;
      app.get('/api/config', (req, res) => {
        res.json({ apiUrl });
      });
    }
  }
};
```

### Access current environment

```js
// Server-side
const currentEnv = gasket.config.env; // 'dev', 'test', 'prod', etc.
```

## Solution 2: Using `@gasket/data` for Client-Server Data Transfer

✅ **For passing server data to client:**

### Server-side: Prepare data for the client

```js
// In a plugin lifecycle
export default {
  name: 'config-plugin',
  hooks: {
    // Use publicGasketData to expose data to the browser
    publicGasketData(gasket, data) {
      return {
        ...data,
        apiUrl: gasket.config.apiUrl,
        // Don't expose sensitive config like secrets or internal URLs
        features: {
          enableNewFeature: gasket.config.env === 'prod'
        }
      };
    }
  }
};
```

### Client-side: Access the data

```js
// In your React component or client-side code
import { gasketData } from '@gasket/data';

function ApiClient() {
  const data = gasketData();
  const { apiUrl } = data;

  return fetch(`${apiUrl}/users`);
}
```

### Next.js Page Router: Access in `getInitialProps`

```js
// pages/users.js
import { gasketData } from '@gasket/data';
import gasket from '../gasket.js';

export default function UsersPage({ users }) {
  return <UserList users={users} />;
}

UsersPage.getInitialProps = async ({ req }) => {
  if (req) {
    // Server-side: use the gasket action to get public data
    const publicData = await gasket.actions.getPublicGasketData(req);
    const response = await fetch(`${publicData.apiUrl}/users`);
    return { users: await response.json() };
  } else {
    // Client-side: use gasketData
    const { apiUrl } = gasketData();
    const response = await fetch(`${apiUrl}/users`);
    return { users: await response.json() };
  }
};
```

### Next.js App Router: Server Components

```js
// app/users/page.js
import gasket from '../../gasket.js';

export default async function UsersPage() {
  // Server components can access gasket config directly
  const { apiUrl } = gasket.config;
  const response = await fetch(`${apiUrl}/users`);
  const users = await response.json();

  return <UserList users={users} />;
}
```

## Solution 3: API-Based Configuration

✅ **For dynamic configuration:**

### Create a configuration endpoint

```js
// In your server setup
export default {
  name: 'config-api',
  hooks: {
    express(gasket, app) {
      app.get('/api/config', (req, res) => {
        // Only expose client-safe configuration
        res.json({
          apiUrl: gasket.config.apiUrl,
          features: {
            betaFeatures: gasket.config.env !== 'prod'
          },
          // Never expose: secrets, internal URLs, GASKET_ENV, etc.
        });
      });
    }
  }
};
```

### Client-side usage

```js
// Client-side configuration fetcher
async function getConfig() {
  const response = await fetch('/api/config');
  return response.json();
}

// Use in your app
const config = await getConfig();
const apiUrl = config.apiUrl;
```

## Advanced: Environment-Based Bundle Builds

If you absolutely need different client bundles per environment (not recommended), you can build separate bundles manually:

```bash
# Build for each environment
GASKET_ENV=dev npm run build
GASKET_ENV=prod npm run build
```

⚠️ **This approach is discouraged because:**
- Increases build complexity
- Can lead to environment-specific bugs
- Makes deployments more complex
- Violates separation of concerns

## Best Practices Summary

1. **Use environment-specific configuration** in your `gasket.js` file
2. **Use `gasket.config.env`** to access the current environment in server-side code only when necessary
3. **Use `@gasket/data`** to pass server-side configuration to the client
4. **Create API endpoints** for dynamic configuration needs
5. **Never expose sensitive data** like secrets, internal URLs, or infrastructure details
6. **Keep client bundles environment-agnostic** when possible
7. **Use the GASKET_ENV protection** to catch accidental leaks early
