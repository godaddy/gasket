# @gasket/plugin-docsify

Use [Docsify] to serve a website view of the collated docs from
[@gasket/plugin-docs].

## Setup

First, install this plugin along with the docs plugin:

```
npm install @gasket/plugin-docs @gasket/plugin-docsify
```

Next, add these to the `plugins` section of your `gasket.config.js`:

```diff
// gasket.config.js

module.exports = {
  plugins: [
+    add: ['@gasket/docs', '@gasket/docsify']
  ]
}
```

Now, when you run `npx gasket docs` in your app, a nice Docsify website will
be launched in your browser.

## Options

To be set in under `docsify` in the `gasket.config.js`.

- `theme` - (string) Name of the theme. Default is `vue`. Can be set to name of
  [docsify themes], a URL, or CSS file.
- `port` - (number) Port to serve the docs from. Default is `3000`.
- `config` - (object) Any [Docsify config] properties, expect for functions
  types which are not currently supported.
  Default has `auth2top` and `relativePath` set to `true`.
- `stylesheets` (string[]) - Optional additional stylesheet URLs to load.
- `scripts` (string[]) - Optional additional scripts files, which can include
  [docsify plugins].

### Example

This example uses the `dark` theme, and enables the [Google Analytics plugin]
by adding the script and config.

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

<!-- LINKS -->

[Docsify]: https://docsify.js.org
[docsify themes]: https://docsify.js.org/#/themes
[docsify config]: https://docsify.js.org/#/configuration
[docsify plugins]: https://docsify.js.org/#/plugins
[Google Analytics plugin]: https://docsify.js.org/#/plugins?id=google-analytics

[@gasket/plugin-docs]: /packages/gasket-plugin-docs/README.md
