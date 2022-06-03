# @gasket/plugin-morgan

Adds the `morgan` request logger to your application.

[Morgan] is an HTTP request logger middleware for node.js.

## Installation

### Requirements

- [@gasket/plugin-express]
- [@gasket/plugin-log]

### New apps

```
gasket create <app-name> --plugins @gasket/plugin-express --plugins @gasket/plugin-morgan
```

### Existing apps

```
npm i @gasket/plugin-morgan
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-morgan'
    ]
  }
}
```

## Configuration

All the configurations for the plugin are added under `morgan` in the config:

- `format`: The log format to print.
- `options`: Morgan options.

See more format and options on [Morgan middleware page][Morgan].

### Example configuration

Defaults:

```js
module.exports = {
  plugins: {
    add: [
      '@gasket/plugin-log',
      '@gasket/plugin-morgan'
    ]
  },
  morgan: {
    format: 'tiny',
    options: {}
  }
}
```

## How it works

This plugins hooks the [middleware] lifecycle from [@gasket/plugin-express].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Morgan]: http://expressjs.com/en/resources/middleware/morgan.html
[@gasket/plugin-express]: /packages/gasket-plugin-express/README.md
[@gasket/plugin-log]: /packages/gasket-plugin-log/README.md
