# @gasket/request Examples

This document provides working examples for all exported functions, classes, and utilities from `@gasket/request`.

## GasketRequest

The `GasketRequest` class represents a normalized request object.

```js
import { GasketRequest } from '@gasket/request';

// Create a new GasketRequest instance
const gasketRequest = new GasketRequest({
  headers: {
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0'
  },
  cookies: {
    sessionId: 'abc123',
    theme: 'dark'
  },
  query: {
    page: '1',
    limit: '10'
  },
  path: '/api/users'
});

console.log(gasketRequest.headers['content-type']); // 'application/json'
console.log(gasketRequest.cookies.sessionId); // 'abc123'
console.log(gasketRequest.query.page); // '1'
console.log(gasketRequest.path); // '/api/users'
```

## makeGasketRequest

Converts various request-like objects into a normalized `GasketRequest`.

### Express Request

```js
import express from 'express';
import { makeGasketRequest } from '@gasket/request';

const app = express();

app.get('/users', async (req, res) => {
  // Convert Express request to GasketRequest
  const gasketRequest = await makeGasketRequest(req);

  console.log(gasketRequest.headers);
  console.log(gasketRequest.cookies);
  console.log(gasketRequest.query);
  console.log(gasketRequest.path);

  res.json({ success: true });
});
```

### Next.js Request

```js
import { NextRequest } from 'next/server';
import { makeGasketRequest } from '@gasket/request';

export async function middleware(request) {
  // Convert NextRequest to GasketRequest
  const gasketRequest = await makeGasketRequest(request);

  console.log(gasketRequest.path);
  console.log(gasketRequest.query);
  console.log(gasketRequest.cookies);

  return NextResponse.next();
}
```

### Custom Request Object

```js
import { makeGasketRequest } from '@gasket/request';

// Create from minimal request-like object
const requestLike = {
  headers: {
    'authorization': 'Bearer token123',
    'content-type': 'application/json'
  },
  url: '/api/data?filter=active&sort=name',
  cookies: {
    sessionId: 'xyz789'
  }
};

const gasketRequest = await makeGasketRequest(requestLike);
console.log(gasketRequest.path); // '/api/data'
console.log(gasketRequest.query); // { filter: 'active', sort: 'name' }
```

### Headers Object

```js
import { makeGasketRequest } from '@gasket/request';

// Using Headers Web API
const headers = new Headers();
headers.set('content-type', 'application/json');
headers.set('x-api-key', 'secret123');

const gasketRequest = await makeGasketRequest({
  headers,
  path: '/api/endpoint',
  query: { version: 'v1' }
});

console.log(gasketRequest.headers['content-type']); // 'application/json'
```

## withGasketRequest

Higher-order function that wraps GasketActions functions to receive a normalized `GasketRequest`.

### Basic Usage

```js
import { withGasketRequest } from '@gasket/request';

// Define an action that works with GasketRequest
const getUserAction = withGasketRequest(
  async function handler(gasket, gasketRequest) {
    const userId = gasketRequest.query.userId;
    const authToken = gasketRequest.headers.authorization;

    // Use gasketRequest properties
    console.log(`Getting user ${userId} with auth: ${authToken}`);

    return { userId, authenticated: !!authToken };
  }
);
```

### With Additional Arguments

```js
import { withGasketRequest } from '@gasket/request';

const processDataAction = withGasketRequest(
  async function handler(gasket, gasketRequest, dataType, options) {
    const locale = gasketRequest.headers['accept-language'];
    const userId = gasketRequest.cookies.userId;

    console.log(`Processing ${dataType} for user ${userId} in ${locale}`);

    return {
      dataType,
      userId,
      locale,
      processed: true,
      ...options
    };
  }
);

// Usage with additional arguments
const result = await processDataAction(gasket, req, 'analytics', { format: 'json' });
```

### In Plugin Actions

```js
// In a Gasket plugin
export default {
  name: 'user-plugin',
  actions: {
    getCurrentUser: withGasketRequest(
      async function getCurrentUser(gasket, gasketRequest) {
        const sessionId = gasketRequest.cookies.sessionId;
        const userAgent = gasketRequest.headers['user-agent'];

        if (!sessionId) {
          return null;
        }

        // Fetch user from database using session
        const user = await gasket.actions.findUserBySession(sessionId);

        return {
          ...user,
          userAgent,
          lastAccess: new Date()
        };
      }
    )
  }
};
```

## withGasketRequestCache

Higher-order function that wraps action functions with per-request caching.

### Basic Caching

```js
import { withGasketRequestCache } from '@gasket/request';

// Expensive operation that should be cached per request
const getUserPermissions = withGasketRequestCache(
  async function handler(gasket, gasketRequest) {
    const userId = gasketRequest.cookies.userId;

    console.log(`Fetching permissions for user ${userId}`);

    // Simulate expensive database call
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      userId,
      permissions: ['read', 'write', 'admin'],
      fetchedAt: new Date()
    };
  }
);
```

### Configuration Caching

```js
import { withGasketRequestCache } from '@gasket/request';

const getFeatureFlags = withGasketRequestCache(
  async function handler(gasket, gasketRequest, environment) {
    const userId = gasketRequest.cookies.userId;
    const region = gasketRequest.headers['cf-ipcountry'];

    console.log(`Loading feature flags for user ${userId} in ${region}`);

    const flags = await gasket.actions.loadFeatureFlags({
      userId,
      region,
      environment
    });

    return flags;
  }
);
```

## WeakPromiseKeeper

A utility class for managing weakly-referenced promise caches.

### Basic Usage

```js
import { WeakPromiseKeeper } from '@gasket/request';

const cache = new WeakPromiseKeeper();

// Use object as key
const requestObj = { id: 'req123' };

// Store a promise
const dataPromise = new Promise(resolve =>
  setTimeout(() => resolve({ data: 'value' }), 1000)
);

cache.set(requestObj, dataPromise);

// Check if key exists
console.log(cache.has(requestObj)); // true

// Get the promise/value
const result = await cache.get(requestObj);
console.log(result); // { data: 'value' }

// After promise resolves, get returns the resolved value directly
const cachedResult = cache.get(requestObj); // No await needed
console.log(cachedResult); // { data: 'value' }
```
