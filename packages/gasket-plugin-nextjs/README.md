# @gasket/plugin-nextjs

This plugin adds Next.js to your application.

## Installation

```
npm i @gasket/plugin-nextjs
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginNextjs from '@gasket/plugin-nextjs';

export default makeGasket({
  plugins: [
+   pluginNextjs
  ]
});
```

### Environment Variables

The `GASKET_DEV` environment variable is used to signal the programmatic execution of the Next.js development server when working with a **custom Next.js server**. Set this variable to a truthy value in order to run the Next.js development server.

```bash
GASKET_DEV=1 npm run local
```

## Configuration

It is also possible for apps to config Next.js using the `gasket.js`
file. To do so, specify a `nextConfig` object property in the same form as what
you would set for [custom configurations][next.config] or using Next.js plugins.

#### Example Gasket configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginNextjs
  ],
  nextConfig: {
    poweredByHeader: false,
    useFileSystemPublicRoutes: false
  }
});
```

In order for Next.js to pick up the configurations, you will need to create a
`next.config.js` file in the root of your project and export the results of the
[getNextConfig] action.

```js
// next.config.js
import gasket from './gasket.js';
export default gasket.actions.getNextConfig();
```

### Next.js 16 and the Webpack bundler

This plugin requires **Next.js 16** or later and injects Webpack configuration
into your Next app. In Next.js 16, Turbopack is the default bundler, so Gasket
apps must use the `--webpack` flag when running the Next CLI. Generated apps
and scripts use `next build --webpack` and `next dev --webpack` by default.
Next.js 16 also requires **Node.js 20.9+**.

For general Webpack configurations, it is recommended to use features of the
Gasket [Webpack plugin], which will be merged into the Next.js configuration.

### Internationalized Routing

When using this plugin along with [@gasket/plugin-intl] to determine and provide
locale files, be sure to set the [i18n config] for `defaultLocale` and supported
`locales` in the `intl` plugin config, instead of the `nextConfig`. This will be
used by the Gasket Intl plugin, and also passed along with the Next config for
i18n routing.

```diff
// gasket.js
export default makeGasket({
  intl: {
+    defaultLocale: 'en-US',
+    locales: ['en-US', 'fr', 'nl-NL']
  },
  nextConfig: {
    i18n: {
-    locales: ['en-US', 'fr', 'nl-NL'],
-    defaultLocale: 'en-US',
    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en-US',
      },
      {
        domain: 'example.nl',
        defaultLocale: 'nl-NL',
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
      },
    ],
    }
  }
});
```

Also note when using [@gasket/plugin-intl] to determine the locale, that the
`NEXT_LOCALE` cookie will have no effect. You can, of course, hook the [intlLocale]
lifecycle in an app to enable that behavior if desired.

## Adding a Sitemap

When creating a new application with this plugin, you will be prompted with a
question in the CLI asking if you would like to add a [sitemap] to your application.

Answering yes to this question will install `next-sitemap` as a dependency,
generate a next-sitemap.config.js file, and add a `sitemap` npm script to your
package.json. `next-sitemap` is an npm package that generates sitemaps and a
robots.txt file for Next.js applications. Learn more by reading the [next-sitemap docs].

## Actions

### getNextConfig

This action returns the current `nextConfig` object
which allows plugins to configure the Next.js application.

Place this in a `next.config.js` file which Next.js will load.

```js
// next.config.js

import gasket from './gasket.js';
export default gasket.actions.getNextConfig();
```

### getNextRoute

This action is intended for use in server contexts where you need to know how a
request will route to a Next.js page.
This async function returns null if the manifest could not be parsed or if the
requested URL does not match a route.
If a match _is_ found, an object with these properties is returned:

| Property | Type | Description |
|----------|------|-------------|
| `page`    | `String`  | The page name/path used to identify a page within next.js |
| `regex`   | `RegExp`  | The regular expression that matches URLs to the page |
| `routeKeys` | `Object`  | For dynamic routes the mapping of URL placeholders to parsed route parameters |
| `namedRegex`  | `RegExp`  | Like `regex`, but [named capturing groups] are included to populate dynamic routing parameters |

```javascript
import gasket from '../gasket.js';

async function someMiddleware(req, res, next) {
  const route = await gasket.actions.getNextRoute();
  if (route) {
    const { groups } = req.url.match(route.namedRegex);
    console.log(`Matched ${route.page} with parameters`, groups);
  }

  next();
}
```

## Lifecycles

### next

Executed when the `next` server has been created. It will receive a reference to
the created `next` instance.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    /**
     * Modify the Next app instance
     * @param  {Gasket} gasket The Gasket API
     * @param  {Next} next Next app instance
     */
    next: function next(gasket, next) {
      next.setAssetPrefix('https://my.cdn.com/dir/');
    }
  }
};
```

### nextConfig

Executed before the `next` server has been created. It will receive a reference
to the `next` config. This will allow you to modify the `next` config before the
`next` server is created.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    /**
     * Modify the Next config
     * @param  {Gasket} gasket The Gasket API
     * @param  {Object} config Next config
     * @returns {Object} config
     */
    nextConfig(gasket, config) {
      return {
        ...config,
        modification: 'newValue'
      };
    }
  }
};
```

### nextExpress

Provides access to both `next` and `express` instances which allows
`next.render` calls in express-based routes.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    nextExpress: function (gasket, { next, express }) {
      express.post('/contact-form', (req, res) => {
        // DO STUFF WITH RECEIVED DATA
        //
        // And once we're done, we can `next.render` to render the `pages/thanks`
        // file as a response.
        next.render(req, res, '/thanks', req.params);
      });
    }
  }
};
```

### nextFastify

Provides access to both `next` and `fastify` instances which allows
`next.render` calls in express-based routes.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    nextFastify: function (gasket, { next, fastify }) {
      fastify.post('/contact-form', (req, res) => {
        // DO STUFF WITH RECEIVED DATA
        //
        // And once we're done, we can `next.render` to render the `pages/thanks`
        // file as a response.
        next.render(req, res, '/thanks', req.params);
      });
    }
  }
};
```

### nextPreHandling

Enables execution of custom logic just prior to an HTTP request being handed to next.js for processing. Hooks receive the request, response, and next server (not to be confused with the next function used by express-like middleware):

```js
export default {
  name: 'sample-plugin',
  hooks: {
      async nextPreHandling(gasket, {
          req,
          res,
          nextServer
      }) {
          await doPreRenderingLogic(req, res);
      }
  }
};
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

<!--[next.config]-->

[nextconfig lifecycle]: #nextconfig
[getNextConfig]: #getnextconfig
[@gasket/plugin-intl]: /packages/gasket-plugin-intl/README.md
[intllocale]: /packages/gasket-plugin-intl/README.md#intllocale
[webpack plugin]: /packages/gasket-plugin-webpack/README.md
[next.config]: https://nextjs.org/docs#custom-configuration
[i18n config]: https://nextjs.org/docs/advanced-features/i18n-routing#getting-started
[named capturing groups]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences
[sitemap]: https://www.sitemaps.org/
[next-sitemap docs]: https://github.com/iamvishnusankar/next-sitemap
