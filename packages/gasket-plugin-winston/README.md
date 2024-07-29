# @gasket/plugin-winston

Set up a [winston] logger instance for the Gasket logger.

## Installation

```
npm i @gasket/plugin-winston
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
+   pluginWinston
  ]
});
```

## Configuration

To customize the logger, add a `winston` object to your `gasket.js`. The properties of this object override the default logging configuration supplied by Gasket.

```js
export default makeGasket({
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
});
```

### Options

- Select `winston` configuration values – (multiple) See below for these
  additional supported properties.

The [winston documentation] enumerates which properties can be configured. To support best practices & avoid common gotchas, only a subset of these properties are configurable through `gasket`.

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
> as `Log.levels`) above to ensure your gasket application functions
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

**`gasket.js`**

```js
import { transports } from 'winston';

export default makeGasket({
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
});
```

## Lifecycles

### winstonTransports

To add custom logger transports, you can also hook the `winstonTransports`
lifecycle and return a transport or an array of transports you wish to add to
the logger. Here's an example gasket config and a hook that uses that config to
add a FluentD transport:

```js
// gasket.js
export default makeGasket({
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
});
```

```js
// /lifecycles/log-transports.js

const fluent = require('fluent-logger');
const FluentTransport = fluent.support.winstonTransport();

/**
 * Define additional log transports for your application
 * @param {Gasket} gasket The gasket API
 * @return {Transport|Transport[]} winston Transports to consume
 */
function winstonTransportsHook(gasket) {
  return new FluentTransport('mytag', gasket.config.fluentd);
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
[Formats]: https://github.com/winstonjs/winston#formats
