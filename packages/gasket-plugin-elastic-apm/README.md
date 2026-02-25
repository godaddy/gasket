# @gasket/plugin-elastic-apm

Adds Elastic APM instrumentation to your application

## Installation

```
npm i @gasket/plugin-elastic-apm
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginElasticApm from '@gasket/plugin-elastic-apm';

export default makeGasket({
  plugins: [
+   pluginElasticApm
  ]
});
```

Add `NODE_OPTIONS=--import=./setup.js` to the `package.json` start script:

```diff
  "scripts": {
    "build": "next build",
-   "start": "next start",
+   "start": "NODE_OPTIONS=--import=./setup.js next start",
    "local": "next dev"
  }
```

Add a `setup.js` script to the root of your app

```
// setup.js
import apm from 'elastic-apm-node';

// Elastic APM setup
apm.start({
  serviceName: 'my-service-name',
  captureHeaders: false,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
  // additional configuration options
});
```

## Configuration

The [start recommendations] for the APM agent are to require it as early as
possible in your app. For Gasket apps, using `NODE_OPTIONS=--import=./setup.js`
will accomplish this. To configure the APM agent, set the environment variables
described in the [configuration options documentation].

In particular, the APM server URL (`ELASTIC_APM_SERVER_URL`) and secret token
(`ELASTIC_APM_SECRET_TOKEN`) are both required configuration. If either of these
are not present, the APM agent will be disabled.

### Dotenv

If you wish to use `dotenv`, be sure it is installed and imported in `setup.js`:

```
npm i dotenv
```

```diff
// setup.js
+ import 'dotenv/config';
import apm from 'elastic-apm-node';

// Elastic APM setup
apm.start({
...
```

### Plugin Configurations

The Gasket plugin provides some additional setup helpers. These can be
configured under `elasticAPM` in the `gasket.js`.

- **`sensitiveCookies`** - (string[]) A list of sensitive cookies to filter

#### Filtering Sensitive Cookies

If your application’s users send session credentials or any other sensitive
information in their cookies, you may wish to filter them out before they are
stored in Elasticsearch. Specify a list of cookie names to redact in
`gasket.js`:

```js
export default makeGasket({
  elasticAPM: {
    sensitiveCookies: ['my_jwt', 'userFullName']
  }
});
```

#### Custom Filtering Sensitive Fields

If your application’s users send session credentials or any other sensitive
information in their cookies, you may wish to filter them out before they are
stored in Elasticsearch. Specify a list of cookie names to redact in
`setup.js` using the [sanitizeFieldNames] configuration option:

```diff
// setup.js
import apm from 'elastic-apm-node';

// Elastic APM setup
apm.start({
+   sanitizeFieldNames: ['foo', 'bar', '*token*']
...
```

The `sanitizeFieldNames` config option can be used for:

- request and response HTTP headers
- HTTP request cookies
- any form field captured during an `application/x-www-form-urlencoded` data request

To filter out other data, use the [APM Add Filter API].

### Custom Filters

According to the [Elastic APM docs], the _Elastic APM agent for Node.js is a
singleton_.
This means that you can import and configure the singleton in various
hooks of your Gasket app, such as with the [init] or [express]/[fastify] lifecycles.

## Actions

### getApmTransaction

Use the `getApmTransaction` action to access and decorate the current APM
transaction. This action is available in any lifecycle hook or server-side code.

```js
// example-plugin.js

export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const transaction = await gasket.actions.getApmTransaction(req);
        const locale = await gasket.actions.getIntlLocale(req);
        transaction.setLabel('locale', locale);
        next();
      });
    }
  }
}
```

In the above example, we are hooking the express lifecycle to add middleware
to decorate the transaction.
Calling `getApmTransaction` will also allow other plugins to decorate the
transaction by hooking the `apmTransaction` lifecycle discussed next.

At a minimum, the `getApmTransaction` action must be invoked to execute
the `apmTransaction` lifecycle described below.
This can be adjusted to only run for specific requests.

```js
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        // Only decorate APM transaction for non-API requests
        if(!req.path.startsWith('/api')) {
          await gasket.actions.getApmTransaction(req);
        }
        next();
      });
    }
  }
}
```

## Lifecycles

### apmTransaction

Enables customizing an APM transaction. Hooks receive the current APM
[Transaction] and details about the request. Hooks may be asynchronous. The
request details are as follows:

| Property | Description |
|----------|-------------|
| `req`    | The HTTP request or framework-specific wrapper around it |
| `res`    | The HTTP response or framework-specific wrapper around it |

```javascript
// example-plugin.js

export default {
  name: 'example-plugin',
  hooks: {
    apmTransaction(gasket, transaction, { req, res }) => {
      transaction.setLabel('language', req.headers['accept-language']);
    }
  }
}
```

## How it works

This plugin hooks the Gasket [configure] lifecycle to set additional filtering,
such as for sensitive cookies.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[init]:/packages/gasket-core/README.md#init
[express]:/packages/gasket-plugin-express/README.md#express
[fastify]:/packages/gasket-plugin-fastify/README.md#fastify
[configuration options documentation]:https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuration.html
[start recommendations]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html#apm-start
[Elastic APM docs]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html
[sanitizeFieldNames]:https://www.elastic.co/guide/en/apm/agent/nodejs/4.x/configuration.html#sanitize-field-names
[APM Add Filter API]:https://www.elastic.co/guide/en/apm/agent/nodejs/4.x/agent-api.html#apm-add-filter
[Transaction]:https://www.elastic.co/guide/en/apm/agent/nodejs/current/transaction-api.html
