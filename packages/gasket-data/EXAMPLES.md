# @gasket/data Examples

This document provides working examples for all exported functions from `@gasket/data`.

## gasketData()

Client-side function to retrieve Gasket data from the DOM. This function looks for a script tag with id `GasketData` and parses its JSON content.

### Basic Usage

```js
import { gasketData } from '@gasket/data';

// In a React component
function MyComponent() {
  const data = gasketData();

  return (
    <div>
      <h1>API URL: {data.apiUrl}</h1>
      <p>Environment: {data.env}</p>
    </div>
  );
}
```

### In a Next.js Page

```js
// pages/index.js
import { gasketData } from '@gasket/data';

export default function HomePage() {
  const data = gasketData();

  return (
    <div>
      <h1>Welcome to {data.appName}</h1>
      <p>Version: {data.version}</p>
    </div>
  );
}
```

## resolveGasketData(gasket, req)

Universal function that works on both client and server. On the client, it calls `gasketData()`. On the server, it calls `gasket.actions.getPublicGasketData(req)`.

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
import gasket from '../gasket.js';

export default async function ServerComponent({ req }) {
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
import { gasketData } from '@gasket/data';

function ConditionalFeature() {
  const data = gasketData();
  const { features = {}, env } = data;

  // Only show in development
  if (env !== 'development' && !features.showBetaFeatures) {
    return null;
  }

  // BetaFeature is a placeholder component for demonstration purposes
  return <BetaFeature />;
}
```
