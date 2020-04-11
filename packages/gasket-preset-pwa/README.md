# @gasket/preset-pwa

Set of plugins to enable a Gasket web app to be a Progressive Web App (PWA).

## Guides

- [Progressive Web Apps Guide]

## Installation

#### New apps

```
gasket create <app-name> --presets @gasket/preset-pwa
```

#### Existing apps

```
npm i @gasket/preset-pwa
```

Modify `plugins.presets` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    presets: [
+      '@gasket/preset-pwa'
    ]
  }
}
```

## Plugins

- [@gasket/plugin-manifest](/packages/gasket-plugin-manifest/README.md)
- [@gasket/plugin-service-worker](/packages/gasket-plugin-service-worker/README.md)
- [@gasket/plugin-workbox](/packages/gasket-plugin-workbox/README.md)

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Progressive Web Apps Guide]:./docs/pwa-support.md
