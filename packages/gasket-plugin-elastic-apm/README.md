# @gasket/plugin-elastic-apm

Adds Elastic APM instrumentation to your application

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-elastic-apm
```

#### Existing apps

```
npm install @gasket/plugin-elastic-apm elastic-apm-node
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-elastic-apm'
    ]
  }
}
```

Add a `--require` flag to a `package.json` start script:

```diff
  "scripts": {
    "build": "gasket build",
-   "start": "gasket start",
+   "start": "gasket start --require elastic-apm-node/start",
    "local": "gasket local"
  }
```

## Configuration

The [start recommendations] for the APM agent are to require it as early as
possible in your app. For Gasket apps, using `--require elastic-apm-node/start`
will accomplish this. To configure the APM agent, set the environment variables
described in the [configuration options documentation].

In particular, the APM server URL (`ELASTIC_APM_SERVER_URL`) and secret token
(`ELASTIC_APM_SECRET_TOKEN`) are both required configuration. If either
of these are not present, the APM agent will be disabled.

### Plugin Configurations

The Gasket plugin provides some additional setup helpers. These can be
configured under `elasticAPM` in the `gasket.config.js`.

- **`sensitiveCookies`** - (string[]) A list of sensitive cookies to filter

#### Filtering Sensitive Cookies

If your application’s users send session credentials or any other sensitive
information in their cookies, you may wish to filter them out before they are
stored in Elasticsearch. Specify a list of cookie names to redact in
`gasket.config.js`:

```js
module.exports = {
  elasticAPM: {
    sensitiveCookies: ['my_jwt', 'userFullName']
  }
};
```

### Custom Start Configurations

For scenarios where you need to configure the start options for the APM agent,
you can do so in a custom setup script and require it instead.

For example, add a `setup.js` script to the root of your app:

```
// setup.js
require('elastic-apm-node').start({
  // any configuration options
})
```

Then adjust your start script to require it instead:

```diff
-   "start": "gasket start --require elastic-apm-node/start",
+   "start": "gasket start --require ./setup.js",
```

### Custom Filters

According to the [Elastic APM docs], the _Elastic APM agent for Node.js is a
singleton_. This means that you can require and configure singleton in various
hooks of your Gasket app, such as with the [init] or [middleware] lifecycles.

## Lifecycles

### apmTransaction

Enables customizing an APM transaction. Hooks receive the current APM [Transaction](https://www.elastic.co/guide/en/apm/agent/nodejs/current/transaction-api.html) and details about the request. Hooks may be asynchronous. The request details are as follows:

| Property | Description |
|----------|-------------|
| `req`    | The HTTP request or framework-specific wrapper around it |
| `res`    | The HTTP response or framework-specific wrapper around it |

```javascript
// /lifecycles/apm-transaction.js

module.exports = (gasket, transaction, { req, res }) => {
  transaction.setLabel('language', req.headers['accept-language']);
}
```

## How it works

This plugin hooks the Gasket [preboot] lifecycle from [@gasket/plugin-start]
and will set up additional filtering, such as for sensitive cookies. If the
`preboot` hook finds that the APM agent has not yet been started using the
recommended `--require elastic-apm-node/start`, it will start it here.
However, you risk not bootstrapping necessary modules with a late start.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[preboot]:/packages/gasket-plugin-start/README.md#preboot
[init]:packages/gasket-plugin-command/README.md#init
[middleware]:/packages/gasket-plugin-express/README.md#middleware
[configuration options documentation]:https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuration.html
[start recommendations]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html#apm-start
[Elastic APM docs]:https://www.elastic.co/guide/en/apm/agent/nodejs/master/agent-api.html
