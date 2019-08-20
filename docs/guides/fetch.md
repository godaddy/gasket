# Data Fetching with SSO JWT

Gasket based apps should use [@gasket/fetch](/packages/gasket-fetch) module for making
any XHR calls. @gasket/fetch internally uses [cross-fetch](https://github.com/lquixada/cross-fetch),
which is based on the [Fetch Api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Simple use case

Making a simple call to an endpoint which is not secured is easy. E.g.:

```js
const fetch = require('@gasket/fetch');

(async function() {
  const response = await fetch('https://...');
  if(response.ok) {
    // handle success response from endpoint
  } else {
    // handle fail response from endpoint
  }
})();
```

## Pass cookies for secured calls

The default value for credentials is not consistent across browsers. Until recently, 
`cross-fetch` did not include cookies by default with the api calls. If the api 
endpoint is secured and accepts credentials in cookies, then you should add the 
`credentials` option to the call to ensure that cookies are sent.

```diff
const fetch = require('@gasket/fetch');

(async function() {
-  const response = await fetch('https://...');
+  const response = await fetch('https://...', {
+   credentials: 'same-origin'
+  });
  if(response.ok) {
    // handle success response from endpoint
  } else {
    // handle fail response from endpoint
  }
})();
```

The `credentials` option accepts:

- `omit` - don't include cookies
- `same-origin` - include, but only if the protocol/hostname/port matches exactly. 
The api must be enabled to accept credentials for this option to work.
- `include` - always include. The cookies available for the **called** domain will 
be sent with this option. The api must be enabled to accept credentials, and also to 
accept calls from the calling domain (CORS), for this option to work.

## Proxy the call through gasket server

There may be a situation where either the...

1. Api is **not** enabled to accept credentials via cookies.

2. Api does not accept calls from the calling domain

   **E.g.** If you make a fetch call to an api and get this error response

   ```console
   Failed to load https://some-api.some-end-point.com/v1/data: Redirect from '...' to '..'
   has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on
   the requested resource. Origin '<Originating URL>' is therefore not allowed access.
   ```

3. Api is in a different domain and you need to pass cookies from the originating domain.

   **E.g.** If your app is running at some-end-point.com domain and needs to make a fetch
   call to other-end-point.com domain. The SSO credentials will be available for 
   some-end-point.com domain only, so using the `include` option won't help here.

4. If the Api is using a client cert or username/password for security. Some of the
   legacy applications/endpoints are still using username/password for security. These
   will need to be maintained on the server. Similarly some Apis use SSL cert for security.
   Those certs will need to be available for making these calls. Since we can't keep such 
   sensitive data on the client side, these will have to be stored securely on the server.

   **E.g.** SOAP based api for Orion uses plain text username/password for creating 
   a security token.

### Add proxy using plugins

The easiest way to add a proxy for an api is by using the plugins functionality of Gasket.
You can do it by simply dropping in a file in the `plugins` folder. 

Here's an example where couple of `GET` calls are being proxied through gasket server. 
The `proxy` function is passing the cookie explicitly with the `fetch` call.

```js
const fetch = require('@gasket/fetch');

module.exports = {
  name: 'example',
  hooks: {

    middleware: function (gasket) {
      function proxy(uri, req) {
        return async function (params) {
          // Use params here to build the correct url/body
          const url = 'https://api.endpoint.base.url' + uri;
          const response = await fetch(url, {
            headers: {
              cookie: req.get('cookie')
            }
          });
          return response.json();
        };
      }

      return function (req, res, next) {
        req.getEndPointExample1 = proxy('/endpoint1/', req);
        req.getEndPointExample2 = proxy('/endpoint2/', req);
        next();
      };
    },

    express: function (gasket, app) {
      app.get('/endpoint1', async function (req, res) {
        const { query, params } = req;
        const data = await req.getEndPointExample1({ query, params });
        res.send(data);
      });
      app.get('/endpoint2', async function (req, res) {
        const data = await req.getEndPointExample2();
        res.send(data);
      });
    }
  }
};

### Using proxy to make api calls server-side

Having a proxy middleware function also makes it easier to make a server-side api call.

```js
ExPage.getInitialProps = async function (ctx) {
  const { req, isServer } = ctx;

  if (isServer) {
    const { query, params } = req;
    const data = await req.getEndPointExample1({ query, params });
    return { data };
  }

  return {};
};
```
