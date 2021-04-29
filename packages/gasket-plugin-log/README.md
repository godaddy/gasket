# @gasket/plugin-log

Adds a [winston] logger instance to your Gasket instance. For documentation on
the logger itself, see [@gasket/log].

## Installation

#### New apps

```shell
gasket create <app-name> --plugins @gasket/plugin-log
```

#### Existing apps

```shell
npm i @gasket/plugin-log @gasket/log
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-log'
    ]
  }
}
```

## Configuration

To customize the logger, add a `winston` or `log` object to your
`gasket.config.js`. The properties of this object override the default logging
configuration supplied by Gasket.

```js
module.exports = {
  log: {
    prefix: 'my-app'
  },
  winston: {
    level: 'warning'
  },

  environments: {
    local: {
      winston: {
        level: 'debug'
      }
    }
  }
};
```

### Options

- `prefix` - (string) used to set the prefix in the `winston` format.
- Select `winston` configuration values – (multiple) See below for these
  additional supported properties.

The [winston documentation] enumerates which properties can be configured on
using `createLogger`. To support best practices & avoid common gotchas only a
subset of these properties are configurable through `gasket`.

**Configurable in `gasket`**

| Name         | Default                               | Description                                              |
|:-------------|:--------------------------------------|:---------------------------------------------------------|
| `level`      | `'info'` (`'debug'` in ENV=local)     | Log only if `info.level`less than or equal to this level |
| `transports` | `[new Console()]` _(Console logging)_ | Set of logging targets for `info` messages               |
| `silent`     | `false`                               | If true, all logs are suppressed                         |
| `levels`     | `winston.config.syslog.levels`        | Levels (and colors) representing log priorities          |
| `format`      | Gasket-defined format                | Formatting for messages (see: [Formats])                 |

> **Note:** While `levels` are configurable, if you specify your own levels,
> you should specify a superset of the default levels (available
> as `Log.levels`) above to ensure you're gasket application functions
> successfully. You are also responsible for calling `winston.addColors` for
> any additional levels that you provide.

> **Note:** While `format` is configurable, it is recommended that you call
> `format.combine` with your custom formats and the result of
> `Log.getDefaultFormat(local,prefix)` to maintain the consistent functionality

**Not Configurable in `gasket`**

| Name          | Fixed Value                    | Description                                     |
|:--------------|:-------------------------------|:------------------------------------------------|
| `exitOnError` | `true`                         | Ensures uncaught errors trigger `process.exit`  |

#### Example adding custom Winston transports

`Console` transports are set by default. Loggers provided by `winston` are
highly customizable using [Transports].

**`gasket.config.js`**

```js
const { transports } = require('winston');

module.exports = {
  winston: {
    level: 'warning',
    transports: [
      // Unified errors.log for all error messages
      // in all environments
      new transports.File({
        filename: 'errors.log',
        level: 'error'
      })
    ]
  }
}
```

Often defining your `winston` transports are:

1. **Dependent on the configured environment.** e.g. only turn on the `Console`
   transport when `NODE_ENV=development`.
2. **Dependent on Gasket config.** e.g. adding a `fluentd` Transport that is
   configured against the `fluentd` endpoint in the current environment.

For these scenarios the `@gasket/log` plugin exposes a `logTransports` hook:

**`gasket.config.js`**

```js
module.exports = {
  winston: {
    level: 'warning'
  },

  fluentd: {
    host: 'localhost',
    port: 24224,
    timeout: 3
  },

  environments: {
    prod: {
      fluentd: {
        host: 'k8cluster.dns.fluentd',
        port: 24224,
        timeout: 3
      }
    }
  }
};
```

## Lifecycles

### logTransports

To handle the `logTransports` hook to create the transport(s) appropriately:

```js
const fluent = require('fluent-logger');
const FluentTransport = fluent.support.winstonTransport();

/**
 * Define additional log transports for your application
 * @param {Gasket} gasket The gasket API
 * @return {Transport|Transport[]} winston Transports to consume
 */
function logTransportsHook(gasket) {
  return new FluentTransport('mytag', fluentConfig);
};
```

## Test

If you are contributing to this plugin, use the following to run the tests:

```shell
npm test
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[winston]: https://github.com/winstonjs/winston
[winston documentation]: https://github.com/winstonjs/winston#creating-your-own-logger
[@gasket/log]: /packages/gasket-log/README.md
[Formats]: https://github.com/winstonjs/winston#formats
