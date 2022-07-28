# @gasket/log

Gasket client and server logger

## Installation

```
npm i @gasket/log @gasket/plugin-log
```

## Configuration

See the [@gasket/plugin-log] for more details on configuration.

## Usage

### Levels

Syslog levels are used by this packaged. Each level is exposed as a method on
both server and client logger instances.

| Level   | Description                                                   |
|:--------|:--------------------------------------------------------------|
| debug   | Information useful to developers for debugging.               |
| info    | Normal operational messages that require no action.           |
| notice  | Events that are unusual, but not error conditions.            |
| warning | May indicate that an error will occur if action is not taken. |
| error   | Error conditions                                              |
| crit    | Critical conditions                                           |
| alert   | Should be corrected immediately                               |
| emerg   | System is unusable                                            |

### Server

The server requires [@gasket/plugin-log] to set up a logger instance on the
gasket object. This will make the logger instance available for use such as:

```js
gasket.logger.error('Critical malfunction in code execution');
gasket.logger.info('Initializing @gasket/engine `start` lifecycle event');
```

The server uses [winston] used for logging. If your app is running locally, all
messages are transported to `process.stdout` aka the `console`.

### Client

For client logging, new logger instances can be instantiated as need. For
example, in a component:

```jsx
import React from 'react';
import Log from '@gasket/log';
import someAction from './some-feature';

class YourComponent extends React.Component {
  constructor() {
    super(...arguments);
    this.logger = new Log();
  }

  doSomething = async () => {
    this.logger.debug('Starting doing something');
    try {
      const results = await someAction();
      this.logger.info(`Did the thing: ${results}`);
    } catch (e) {
      this.logger.error('Something bad happened');
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.doSomething}></button>
      </div>
    )
  }
}
```

The constructor accepts an object with the following optional properties:

| Property    | Description |
|-------------|-------------|
| `level`     | The maximum logging level to enable output for. Defaults to `info` |
| `levels`    | Array of custom logging level names. |
| `namespace` | String for namespacing your logs. See [diagnostics] for more information. Your namespace is automatically prefixed with `gasket:` |
| `prod`      | If set to `true` enables logging even for production builds. By default production builds have no client-side logging. |

> **NOTE:** The client logger uses [diagnostics] to output log messages to the
> console. Ensure one of the trigger mechanics for [diagnostics in browser] is
> set. The name used for diagnostics is `gasket*`.

## Test

```
npm test
```

Alternatively, you can also run the client or server tests separate.

```
npm run test:client
npm run test:server
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[winston]: https://github.com/winstonjs/winston
[diagnostics]: https://github.com/bigpipe/diagnostics
[diagnostics in browser]: https://github.com/bigpipe/diagnostics#browser
[@gasket/plugin-log]: /packages/gasket-plugin-log/README.md
