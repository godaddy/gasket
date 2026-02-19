# @gasket/plugin-data Examples

This document provides working examples for all exported methods, actions, and lifecycles from `@gasket/plugin-data`.

## Actions

### getGasketData

Get the complete Gasket data configuration.

```js
// In a plugin hook
export default {
  name: 'example-plugin',
  hooks: {
    async express(gasket, app) {
      const gasketData = await gasket.actions.getGasketData();
      console.log('API URL:', gasketData.apiUrl);
      console.log('Private setting:', gasketData.privateKey);
    }
  }
};

// In application code
import gasket from './gasket.js';

async function getConfig() {
  const data = await gasket.actions.getGasketData();
  return data;
}
```

### getPublicGasketData

Get public Gasket data for a specific request. This data is safe to expose to the client.

```js
// In Express lifecycle
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const publicData = await gasket.actions.getPublicGasketData(req);
        console.log('Public data:', publicData);
        next();
      });
    }
  }
};

// In Next.js API route
import gasket from '../../gasket.js';

export default async function handler(req, res) {
  const publicData = await gasket.actions.getPublicGasketData(req);
  res.json(publicData);
}

// In Next.js getServerSideProps
import gasket from '../gasket.js';

export async function getServerSideProps({ req }) {
  const publicData = await gasket.actions.getPublicGasketData(req);

  return {
    props: {
      clientConfig: publicData
    }
  };
}
```

## Lifecycles

### gasketData

Modify the Gasket data after environment overrides are applied. This runs once during startup.

```js
// Plugin that fetches remote configuration
export default {
  name: 'remote-config-plugin',
  hooks: {
    async gasketData(gasket, data) {
      // Fetch additional config from remote service
      const remoteConfig = await fetch('https://config-service.example.com/config')
        .then(res => res.json());

      return {
        ...data,
        remoteApiUrl: remoteConfig.apiUrl,
        featureFlags: remoteConfig.features,
        public: {
          ...data.public,
          publicApiUrl: remoteConfig.publicApiUrl
        }
      };
    }
  }
};

// Plugin that adds computed values
export default {
  name: 'computed-config-plugin',
  hooks: {
    gasketData(gasket, data) {
      const { env } = gasket.config;

      return {
        ...data,
        isDevelopment: env === 'development',
        buildTime: new Date().toISOString(),
        public: {
          ...data.public,
          environment: env,
          version: process.env.npm_package_version
        }
      };
    }
  }
};
```

### publicGasketData

Modify public data for each request. This allows for request-specific customization.

```js
// Plugin that adds user-specific data
export default {
  name: 'user-data-plugin',
  hooks: {
    async publicGasketData(gasket, publicData, { req }) {
      const userId = req.headers['x-user-id'];

      if (userId) {
        const userPreferences = await getUserPreferences(userId);

        return {
          ...publicData,
          userPreferences,
          userId
        };
      }

      return publicData;
    }
  }
};

// Plugin that adds locale-specific data
export default {
  name: 'locale-plugin',
  hooks: {
    async publicGasketData(gasket, publicData, { req }) {
      const locale = req.headers['accept-language']?.split(',')[0] || 'en-US';
      const localeConfig = await getLocaleConfig(locale);

      return {
        ...publicData,
        locale,
        currency: localeConfig.currency,
        dateFormat: localeConfig.dateFormat
      };
    }
  }
};

// Plugin that adds feature flags based on request
export default {
  name: 'feature-flags-plugin',
  hooks: {
    async publicGasketData(gasket, publicData, { req }) {
      const userAgent = req.headers['user-agent'];
      const isBot = /bot|crawler|spider/i.test(userAgent);

      return {
        ...publicData,
        featureFlags: {
          ...publicData.featureFlags,
          showAdvancedUI: !isBot,
          enableAnalytics: !isBot
        }
      };
    }
  }
};
```

## Configuration Examples

### Basic gasket-data.js

```js
export default {
  apiUrl: 'https://api.example.com',
  secretKey: 'secret-value',
  public: {
    appName: 'My App',
    version: '1.0.0'
  }
};
```

### Environment-specific configuration

```js
export default {
  apiUrl: 'https://api.example.com',
  secretKey: 'default-secret',
  public: {
    appName: 'My App',
    apiUrl: 'https://api.example.com'
  },
  environments: {
    development: {
      apiUrl: 'http://localhost:3001',
      secretKey: 'dev-secret',
      public: {
        apiUrl: 'http://localhost:3001',
        debugMode: true
      }
    },
    test: {
      apiUrl: 'https://test-api.example.com',
      secretKey: 'test-secret',
      public: {
        apiUrl: 'https://test-api.example.com'
      }
    },
    production: {
      secretKey: process.env.SECRET_KEY,
      public: {
        analytics: {
          trackingId: 'GA-123456789'
        }
      }
    }
  }
};
```

## Integration Examples

### With Next.js and @gasket/nextjs

Using the `withGasketData` HOC to inject data into client-side code:

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

export default withGasketData(gasket)(Document);
```

```jsx
// In a component
import { useGasketData } from '@gasket/nextjs';

function MyComponent() {
  const gasketData = useGasketData();

  return (
    <div>
      <h1>{gasketData.appName}</h1>
      <p>API URL: {gasketData.apiUrl}</p>
    </div>
  );
}
```
