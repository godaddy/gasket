# @gasket/data Examples

This document provides working examples for all exported functions from `@gasket/data`.

## gasketData()

Client-side function to retrieve Gasket data from the DOM. This function looks for a script tag with id `GasketData` and parses its JSON content.

### Fetch Wrapper Pattern

Best practice is to use `gasketData()` in utility functions rather than directly in React components:

```js
import { gasketData } from '@gasket/data';

async function fetchSomeData() {
  // Must be called in the browser
  if (typeof window !== 'undefined') {
    const data = gasketData();
    return fetch(`${data.apiUrl}/some-endpoint`);
  }
  throw new Error('gasketData() can only be called in the browser');
}

// Usage
async function loadUserData() {
  const response = await fetchSomeData();
  return response.json();
}
```

### React Hook Pattern (Recommended)

The best practice for React components is to use the `useGasketData` hook from `@gasket/nextjs`. Note that this requires `withGasketDataProvider` to be set up in your app:

```js
'use client';
// app/components/ClientConfig.js
import { useGasketData } from '@gasket/nextjs';

export default function ClientConfig() {
  const data = useGasketData();

  return (
    <div>
      <h1>Welcome to {data.appName || 'My App'}</h1>
      <p>API URL: {data.apiUrl || 'Not configured'}</p>
      <p>Environment: {data.env || 'Unknown'}</p>
    </div>
  );
}
```

**Note:** The `useGasketData` hook requires `withGasketDataProvider` to be configured in your app. See the [@gasket/nextjs documentation](../gasket-nextjs/README.md#withGasketDataProvider) for setup instructions.

### App Router Client Component (Alternative)

If you need to use `gasketData()` directly, use App Router with 'use client' directive:

```js
'use client';
// app/components/ClientConfig.js
import { gasketData } from '@gasket/data';

export default function ClientConfig() {
  const data = gasketData();

  return (
    <div>
      <h1>Welcome to {data.appName || 'My App'}</h1>
      <p>API URL: {data.apiUrl || 'Not configured'}</p>
      <p>Environment: {data.env || 'Unknown'}</p>
    </div>
  );
}
```

## resolveGasketData(gasket, req)

Universal function that works on both client and server. On the client, it calls `gasketData()`. On the server, it calls `gasket.actions.getPublicGasketData(req)`.

### Next.js getInitialProps (Page Router)

This example shows `resolveGasketData` working universally - it runs on the server for first requests, then in the browser for client-side routing.

```js
// pages/profile.js
import { resolveGasketData } from '@gasket/data';
import gasket from '../gasket.js';

export default function ProfilePage({ user, gasketData }) {
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>API URL: {gasketData.apiUrl}</p>
      <p>Environment: {gasketData.env}</p>
    </div>
  );
}

ProfilePage.getInitialProps = async ({ req }) => {
  // resolveGasketData automatically handles:
  // - Server-side: calls gasket.actions.getPublicGasketData(req)
  // - Client-side: calls gasketData() from DOM (req will be undefined)
  const data = await resolveGasketData(gasket, req);

  // Fetch user data using the API URL from Gasket data
  // Note: In real apps, consider using a fetch abstraction that handles SSR
  const apiUrl = data.apiUrl || 'http://localhost:3000';
  const userResponse = await fetch(`${apiUrl}/user`);
  const user = await userResponse.json();

  return {
    user,
    gasketData: data
  };
};
```

### Server-Side Usage in Middleware

```js
// middleware/data-middleware.js
import { resolveGasketData } from '@gasket/data';

export default function dataMiddleware(gasket) {
  return async (req, res, next) => {
    try {
      const data = await resolveGasketData(gasket, req);
      console.log(data);
      next();
    } catch (error) {
      console.error('Failed to resolve Gasket data:', error);
      next(error);
    }
  };
}
```

### In a Next.js API Route

```js
// pages/api/config.js
import { resolveGasketData } from '@gasket/data';
import gasket from '../../gasket.js';

export default async function handler(req, res) {
  const data = await resolveGasketData(gasket, req);

  res.json({
    apiUrl: data.apiUrl,
    version: data.version,
    environment: data.env
  });
}
```

### Server Component (Next.js App Router)

```js
// app/components/ServerComponent.js
import { resolveGasketData } from '@gasket/data';
import { request } from '@gasket/nextjs/request';
import gasket from '../gasket.js';

export default async function ServerComponent() {
  const req = await request();
  const data = await resolveGasketData(gasket, req);

  return (
    <div>
      <h2>Server Config</h2>
      <p>API URL: {data.apiUrl}</p>
      <p>Environment: {data.env}</p>
    </div>
  );
}
```

## Common Patterns

### Conditional Rendering Based on Data

```js
'use client';
import { useGasketData } from '@gasket/nextjs';

function ConditionalFeature() {
  const data = useGasketData();
  const { features = {}, env } = data || {};

  // Only show in development or when beta features are enabled
  if (env !== 'development' && !features?.showBetaFeatures) {
    return null;
  }

  // BetaFeature is a placeholder component for demonstration purposes
  return <BetaFeature />;
}
```

### Alternative with Direct gasketData

```js
'use client';
import { gasketData } from '@gasket/data';

function ConditionalFeature() {
  const data = gasketData();
  const { features = {}, env } = data || {};

  // Only show in development or when beta features are enabled
  if (env !== 'development' && !features?.showBetaFeatures) {
    return null;
  }

  // BetaFeature is a placeholder component for demonstration purposes
  return <BetaFeature />;
}
```
