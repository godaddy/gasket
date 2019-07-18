# Gasket log plugin

Adds a [winston] logger instance to your gasket instance. For documentation on
the logger itself, see [@gasket/log].

### Installation

This plugin is published to Artifactory and can be installed with npm:

```
npm install --save @gasket/log-plugin
```

## Usage

This plugin is installed by default, so you most likely already have it. If you
are not using a preset that includes the plugin, add to your `gasket.config.js`
like this:

```js
module.exports = {
  plugins: [
    'log'
  ]
};
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
- Select `winston` configuration values – (multiple) See below for these
  additional supported properties.

The [winston documentation] enumerates which properties can be configured on
using `createLogger`. To support best practices & avoid common gotchas only a
subset of these properties are configurable through `gasket`.

**Configurable in `gasket`**

| Name          | Default                               |  Description    |
| ------------- | ------------------------------------- | --------------- |
| `level`       | `'info'` (`'debug'` in ENV=local)     | Log only if `info.level`less than or equal to this level  |
| `transports`  | `[new Console()]` _(Console logging)_ | Set of logging targets for `info` messages                 |
| `silent`      | `false`                               | If true, all logs are suppressed |

**Not Configurable in `gasket`**

| Name          | Fixed Value                    |  Description    |
| ------------- | ------------------------------ | --------------- |
| `levels`      | `winston.config.syslog.levels` | Levels (and colors) representing log priorities            |
| `format`      | Gasket-defined format          | Formatting for `info` messages (see: [Formats])           |
| `exitOnError` | `true`                         | Ensures uncaught errors trigger `process.exit` |

### Adding custom `winston` transports

`Console` transports are set by default. 
Loggers provided by `winston` are highly customizable using [Transports].

**`gasket.config.js`**
``` js
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
2. **Dependent on gasket config.** e.g. adding a `fluentd` Transport that is
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

#### logTransports

To handle the `logTransports` hook to create the transport(s) appropriately:

```js
const fluent = require('fluent-logger');
const FluentTransport = fluent.support.winston;

/**
 * Define additional log transports for your application
 * @param {Gasket} gasket The gasket API
 * @return {Transport[]} winston Transports to consume
 */
function logTransportsHook(gasket) {
  const { config } = gasket;

  return new FluentTransport(config.fluentd);
};
```

### Test

If you are contributing to this plugin, use the following to run the tests:

```shell
npm test
```

[winston]: https://github.com/winstonjs/winston
[winston documentation]: https://github.com/winstonjs/winston#creating-your-own-logger
[@gasket/log]: https://github.com/godaddy/gasket/tree/master/packages/gasket-log
[Formats]: https://github.com/winstonjs/winston#formats
