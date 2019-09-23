# @gasket/docsify-plugin

Use [Docsify] to serve a website view of the collated docs from
[@gasket/docs-plugin]. 

## Options

To be set in under `docsify` in the `gasket.config.js`.

- `theme` - (string) Name of the theme. Default is `vue`. Can be set to name of
  [docsify themes], a URL, or CSS file.
- `port` - (number) Port to serve the docs from. Default is `3000`.
- `config` - (object) Any [Docsify config] properties. Default has
  `auth2top` set to `true`. Currently, this does not support functions types.
- `stylesheets` (string[]) - Optional additional stylesheet URLs to load.
- `scripts` (string[]) - Optional additional scripts files, which can include
  [docsify plugins].

[Docsify]: https://docsify.js.org
[docsify themes]: https://docsify.js.org/#/themes
[docsify config]: https://docsify.js.org/#/configuration
[docsify plugins]: https://docsify.js.org/#/plugins

[@gasket/docs-plugin]: /packages/gasket-docs-plugin/README.md
