# @gasket/request

The purpose of this package is to provide a consistent request object for Gasket
plugins and apps to use, regardless of the request handling framework.

## Installation

#### Existing apps

```shell
npm install @gasket/request
```

## Functions

### GasketRequest

The `GasketRequest` class is a representation of a request object that can be
used by Gasket plugins and apps. It is a consistent shape that can be used
across different request handling frameworks.

A `GasketRequest` object has the following properties:

| Property | Type   | Description       | Arguments     |
|----------|--------|-------------------|---------------|
| headers  | object | Request headers   | required      |
| cookies  | object | Request cookies   | default: `{}` |
| query    | object | Query parameters  | default: `{}` |
| path     | string | Request path      | default: `''` |

### makeGasketRequest

A `GasketRequest` can be created from a Node `IncomingMessage` object, an
Express `Request` object, or a Next.js `NextRequest` object, amongst others.

```js
import { makeGasketRequest } from '@gasket/request';

export default async function expressHandler(req, res) {
  const gasketRequest = await makeGasketRequest(req);
  // use gasketRequest
}
```

You can also assemble a `GasketRequest` object from parts of a request object.

```js
import { GasketRequest } from '@gasket/request';

const headers = {
  'x-example': 'example'
};

const staticGasketRequest = await makeGasketRequest({ headers });
````

### withGasketRequest

A higher-order function that can wrap a GasketAction function and provides a
`GasketRequest` object as the first argument.
This provides an easy way to normalize the request object for any `GasketAction`
and potential lifecycle hooks.

```js
import { withGasketRequest } from '@gasket/request';

export const myAction = withGasketRequest(
  async function handler(gasket, gasketRequest) {
    // use gasketRequest
  }
);

// example usage
await gasket.actions.myAction(req);
```

If you action need additional arguments, you can pass them following the `gasketReq`.

```js
import { withGasketRequest } from '@gasket/request';

export const myAction = withGasketRequest(
  async function handler(gasket, gasketRequest, arg1, arg2) {
    // use gasketRequest
  }
);

// example usage
await gasket.actions.myAction(req, true, false);
```

### withGasketRequestCache

Much like the previous function, `withGasketRequestCache` is a higher-order
function that wraps an action handler function and provides a `GasketRequest`.
The difference is the handler will only be triggered once per request, and the
result will be cached for subsequent calls.

```js
import { withGasketRequestCache } from '@gasket/request';

export const myAction = withGasketRequestCache(
  async function handler(gasketRequest, req, arg1, arg2) {
    // use gasketRequest
  }
);

// example usage
await gasket.actions.myAction(req, true, false);
```

## Purpose

Why do we need a request object for Gasket?

Some Gasket plugins and apps need to interact with the request object.
Unfortunately, the shape and details of a request object is not consistent
across all request handling frameworks.

For example:

- Node's `IncomingMessage` [docs](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
- Express "enhances" this as `Request` [docs](https://expressjs.com/en/api.html#req)
  - Various other engines also do the same
- Next.js API's (including middleware) use `NextRequest` [docs](https://nextjs.org/docs/pages/api-reference/functions/next-request)
- This extends the browser-compatible Fetch `Request` [docs](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- Next.js App Router does not expose the request object, so we make a representation with the parts available [docs](https://github.com/godaddy/gasket/blob/main/packages/gasket-nextjs/README.md#request)

And we are aware of apps using Gasket for Static Pages with Next.js,
assembling a request-like object to use with certain actions.
