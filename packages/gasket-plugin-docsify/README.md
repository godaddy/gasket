# @gasket/plugin-docsify

Use [Docsify] to serve a website view of the collated docs from
[@gasket/plugin-docs].

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs,@gasket/plugin-docsify
```

#### Existing apps

```
npm i @gasket/plugin-docs @gasket/plugin-docsify
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-docs',
+      '@gasket/plugin-docsify'
    ]
  }
}
```

Now, when you run `npx gasket docs` in your app, a nice Docsify website will be
launched in your browser.

## Configuration

To be set in under `docsify` in the `gasket.config.js`.

- `theme` - (string) Name of the theme. Default is `styles/gasket.css`. Can be
  set to name of [docsify themes], a URL, or CSS file.
- `port` - (number) Port to serve the docs from. Default is `3000`.
- `config` - (object) Any Docsify configuration property except for functions types that are not currently supported. Default has `auth2top` and
  `relativePath` set to `true`, with `maxLevel` at `3`.
- `stylesheets` (string[]) - Optional additional stylesheet URLs to load.
- `scripts` (string[]) - Optional additional scripts files, which can include
  [docsify plugins].

#### Example

This example uses the `dark` theme, and enables the [Google Analytics plugin] by
adding the script and config.

```js
// gasket.config.js

module.exports = {
  docsify: {
    theme: 'dark',
    config: {
      ga: 'UA-XXXXX-Y'
    },
    scripts: [
      '//unpkg.com/docsify/lib/plugins/ga.min.js'
    ]
  }
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Docsify]: https://docsify.js.org
[docsify themes]: https://docsify.js.org/#/themes
[docsify config]: https://docsify.js.org/#/configuration
[docsify plugins]: https://docsify.js.org/#/plugins
[Google Analytics plugin]: https://docsify.js.org/#/plugins?id=google-analytics

[@gasket/plugin-docs]: /packages/gasket-plugin-docs/README.md
