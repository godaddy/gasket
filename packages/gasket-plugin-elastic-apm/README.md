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
import dotenv from 'dotenv/config';
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
possible in your app. For Gasket apps, using `--require ./setup.js`
will accomplish this. To configure the APM agent, set the environment variables
described in the [configuration options documentation].

In particular, the APM server URL (`ELASTIC_APM_SERVER_URL`) and secret token
(`ELASTIC_APM_SECRET_TOKEN`) are both required configuration. If either of these
are not present, the APM agent will be disabled.


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

```
// setup.js
require('dotenv').config();

require('elastic-apm-node').start({
  ...,
  sanitizeFieldNames: ['foo', 'bar', '*token*']
});
```

The `sanitizeFieldNames` config option can be used for:
- request and response HTTP headers
- HTTP request cookies
- any form field captured during an `application/x-www-form-urlencoded` data request

To filter out other data, use the [APM Add Filter API].

### Custom Filters

According to the [Elastic APM docs], the _Elastic APM agent for Node.js is a
singleton_. This means that you can require and configure singleton in various
hooks of your Gasket app, such as with the [init] or [middleware] lifecycles.

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

This plugin hooks the Gasket [preboot] lifecycle from [@gasket/plugin-start] and
will set up additional filtering, such as for sensitive cookies. If the
`preboot` hook finds that the APM agent has not yet been started using the
recommended `--require elastic-apm-node/start`, it will start it here. However,
you risk not bootstrapping necessary modules with a late start.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[preboot]:/packages/gasket-plugin-start/README.md#preboot
[init]:packages/gasket-plugin-command/README.md#init
[middleware]:/packages/gasket-plugin-express/README.md#middleware
[configuration options documentation]:https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuration.html
[start recommendations]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html#apm-start
[Elastic APM docs]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html
[sanitizeFieldNames]:https://www.elastic.co/guide/en/apm/agent/nodejs/4.x/configuration.html#sanitize-field-names
[APM Add Filter API]:https://www.elastic.co/guide/en/apm/agent/nodejs/4.x/agent-api.html#apm-add-filter
[Transaction]:(https://www.elastic.co/guide/en/apm/agent/nodejs/current/transaction-api.html)
