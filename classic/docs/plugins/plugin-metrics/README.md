---
title: ''
hide_title: true
sidebar_label: '@gasket/plugin-metrics'
---

# @gasket/plugin-metrics

Enables plugins to collect metrics about an project when Gasket commands are
invoked.

> **NOTE:** Metrics are **not** collected by `gasket`. The `metrics` lifecycle
> exists so that _you_ can track metrics and usage of `gasket` within your own
> organization.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-metrics
```

#### Existing apps

```
npm i @gasket/plugin-metrics
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-metrics'
    ]
  }
}
```

## Command Flags

### --no-record

Metrics are available for all Gasket project commands. However, if you wish to
not invoke the metrics lifecycle for certain commands or situations, such as a
during a CICD process, you can run the command with the `--no-record` flag.

## Lifecycles

### metrics

The usage of `gasket` commands can be tracked by a plugin using the `metrics`
lifecycle hook. It is important to note that this _does not_ block the execution
of the command.

```js
const fetch = require('@gasket/fetch');

module.exports = {
  name: 'example',
  hooks: {
    /**
     * Hook the metrics lifecycle and pushed data to a collection endpoint
     *
     * @param {Gasket} gasket - The Gasket API
     * @param {Object} data - Collected metrics
     * @returns {Object}
     */
    async metrics(gasket, data) {
      const url = 'https://some.example.api/endpoint';

      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
}
```

The collected `metrics` data consists of the following information:

```json
{
  "name": "name in package.json",
  "version": "version in package.json",
  "gasket": {
    "@gasket/literally-any-repo": "that is installed"
  },
  "repository": "git repository",
  "branch": "git branch",
  "config": {
    "additional keys": "used in gasket.config.js"
  },
  "system": {
    "platform": "os.platform()",
    "release": "os.release()",
    "arch": "os.arch()"
  },
  "env": "NODE_ENV",
  "argv": "Literally the args that you passed to gasket",
  "time": "Date.now()",
  "cmd": "The Gasket command that was run"
}
```

## License

[MIT](../../LICENSE.md)
