# @gasket/plugin-elastic-apm

Adds Elastic APM instrumentation to your application

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-elastic-apm
```

#### Existing apps

```
npm i @gasket/plugin-elastic-apm
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

## Configuration

Configurations for the plugin can be added under `elasticAPM` in the config.
This object accepts the same properties as the Elastic APM Node.js agent. (See
the [configuration options documentation])

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['@gasket/plugin-elastic-apm']
  },
  elasticAPM: {
    secretToken: '****',
    serverUrl: 'http://localhost:9200'
  }
}
```

You may also configure the APM agent with environment variables (e.g:
`ELASTIC_APM_SERVER_URL`) instead of using the config object. These environment
variables are also described in the [configuration options documentation].

The APM server URL (as either `elasticAPM.serverUrl` or
`ELASTIC_APM_SERVER_URL`) and secret token (as either `elasticAPM.secretToken`
or `ELASTIC_APM_SECRET_TOKEN`) are both required configuration fields. If either
of these are not present, the APM agent will be disabled.

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

## How it works

This plugins hooks the [preboot] lifecycle from [@gasket/plugin-start].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[preboot]:/packages/gasket-plugin-start/README.md#preboot
[configuration options documentation]:https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuration.html
